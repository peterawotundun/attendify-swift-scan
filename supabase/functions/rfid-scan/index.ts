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

    const body = await req.json()
    const { rfid_code, api_key } = body
    
    console.log('Received request body:', body)

    // Validate API key (you can set this in Supabase secrets)
    const validApiKey = Deno.env.get('RFID_API_KEY') || 'your-hardware-api-key'
    if (api_key !== validApiKey) {
      console.log('Invalid API key provided:', api_key, 'Expected:', validApiKey)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('RFID scan request:', { rfid_code })

    // Get the latest session ID from attendance_sessions (most recent)
    const { data: latestSession, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('*, classes(*)')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('Session query result:', { latestSession, sessionError })

    if (sessionError) {
      console.error('Session query error:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Database error fetching session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!latestSession) {
      console.log('No session found in database')
      return new Response(
        JSON.stringify({ error: 'No session found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Using latest session:', latestSession.session_code, 'Session ID:', latestSession.id)

    // Find student by RFID code (check students table first, then profiles)
    let student = null;
    let studentName = "Unknown student";
    let matric_number = null;
    let department = null;

    console.log('Looking for student with RFID code:', rfid_code)

    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('rfid_code', rfid_code)
      .maybeSingle()

    console.log('Student query result:', { studentData, studentError })

    if (studentData) {
      student = studentData;
      studentName = studentData.name;
      matric_number = studentData.matric_number;
      department = studentData.department;
      console.log('Found existing student:', studentName)
    } else {
      // Check profiles table for RFID code
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('rfid_code', rfid_code)
        .maybeSingle()

      console.log('Profile query result:', { profileData, profileError })

      if (profileData) {
        // Create student record from profile data
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
          studentName = newStudent.name;
          matric_number = newStudent.matric_number;
          department = newStudent.department;
          console.log('Created student from profile:', studentName)
        }
      }
      
      // If still no student found, create unknown student record
      if (!student) {
        const { data: unknownStudent, error: insertError } = await supabase
          .from('students')
          .insert({
            name: "Unknown student",
            matric_number: `UNKNOWN-${rfid_code}`,
            rfid_code: rfid_code,
            department: "Unknown",
            email: null
          })
          .select()
          .single()

        if (!insertError && unknownStudent) {
          student = unknownStudent;
          studentName = "Unknown student";
          console.log('Created unknown student for RFID:', rfid_code)
        }
      }
    }

    // Check if student already checked in (only if we have a valid student)
    if (student) {
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', latestSession.id)
        .eq('student_id', student.id)
        .maybeSingle()

      if (existingRecord) {
        console.log('Student already checked in:', studentName)
        return new Response(
          JSON.stringify({ 
            error: 'Already checked in', 
            student: studentName,
            check_in_time: existingRecord.check_in_time 
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Record attendance
    console.log('Attempting to record attendance with:', {
      session_id: latestSession.id,
      student_id: student ? student.id : null,
      rfid_scan: rfid_code
    })

    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from('attendance_records')
      .insert({
        session_id: latestSession.id,
        student_id: student ? student.id : null,
        rfid_scan: rfid_code
      })
      .select('*')
      .single()

    console.log('Attendance record result:', { attendanceRecord, attendanceError })

    if (attendanceError) {
      console.error('Error recording attendance:', attendanceError)
      return new Response(
        JSON.stringify({ error: 'Failed to record attendance', details: attendanceError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Attendance recorded successfully:', {
      student: studentName,
      session: latestSession.session_code,
      time: attendanceRecord.check_in_time
    })

    return new Response(
      JSON.stringify({
        success: true,
        student: {
          name: studentName,
          matric_number: matric_number,
          department: department
        },
        check_in_time: attendanceRecord.check_in_time,
        session_code: latestSession.session_code
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