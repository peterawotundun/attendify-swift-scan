import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { rfid_code, session_code, api_key } = await req.json()

    // Validate API key (you can set this in Supabase secrets)
    const validApiKey = Deno.env.get('RFID_API_KEY') || 'your-hardware-api-key'
    if (api_key !== validApiKey) {
      console.log('Invalid API key provided:', api_key)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('RFID scan request:', { rfid_code, session_code })

    // Find student by RFID code (try students table first, then profiles)
    let student = null;
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('rfid_code', rfid_code)
      .maybeSingle()

    if (studentData) {
      student = studentData;
    } else {
      // Check profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('rfid_code', rfid_code)
        .maybeSingle()

      if (profileData) {
        // Create/update student record from profile
        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .upsert({
            name: profileData.full_name,
            matric_number: profileData.matric_number,
            rfid_code: profileData.rfid_code,
            department: profileData.department,
            email: null
          })
          .select()
          .single()

        if (!insertError && newStudent) {
          student = newStudent;
        }
      }
    }

    if (!student) {
      console.log('Student not found for RFID:', rfid_code)
      return new Response(
        JSON.stringify({ error: 'Student not found', rfid_code }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find active session by session code or class code
    let session = null;
    const { data: sessionData, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('*, classes(*)')
      .eq('session_code', session_code)
      .eq('is_active', true)
      .maybeSingle()

    if (sessionData) {
      session = sessionData;
    } else {
      // Try to find by class code if session_code didn't work
      const { data: classSessions, error: classError } = await supabase
        .from('attendance_sessions')
        .select('*, classes!inner(*)')
        .eq('classes.code', session_code)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

      if (classSessions) {
        session = classSessions;
      }
    }

    if (!session) {
      console.log('Active session not found:', session_code)
      return new Response(
        JSON.stringify({ error: 'Active session not found', session_code }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if student already checked in
    const { data: existingRecord } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('session_id', session.id)
      .eq('student_id', student.id)
      .maybeSingle()

    if (existingRecord) {
      console.log('Student already checked in:', student.name)
      return new Response(
        JSON.stringify({ 
          error: 'Already checked in', 
          student: student.name,
          check_in_time: existingRecord.check_in_time 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Record attendance
    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from('attendance_records')
      .insert({
        session_id: session.id,
        student_id: student.id,
        rfid_scan: rfid_code
      })
      .select('*')
      .single()

    if (attendanceError) {
      console.error('Error recording attendance:', attendanceError)
      return new Response(
        JSON.stringify({ error: 'Failed to record attendance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Attendance recorded successfully:', {
      student: student.name,
      session: session_code,
      time: attendanceRecord.check_in_time
    })

    return new Response(
      JSON.stringify({
        success: true,
        student: {
          name: student.name,
          matric_number: student.matric_number,
          department: student.department
        },
        check_in_time: attendanceRecord.check_in_time,
        session_code: session_code
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in RFID scan function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})