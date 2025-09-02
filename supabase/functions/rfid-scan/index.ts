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

    // Validate API key
    const validApiKey = Deno.env.get('RFID_API_KEY') || 'your-hardware-api-key'
    if (api_key !== validApiKey) {
      console.log('Invalid API key provided:', api_key, 'Expected:', validApiKey)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('RFID scan request:', { rfid_code })

    // Check if student already checked in today by looking for existing records with this RFID
    const { data: existingRecord } = await supabase
      .from('attendance_records')
      .select('*, students(*), attendance_sessions(*, classes(*))')
      .eq('rfid_scan', rfid_code)
      .gte('check_in_time', new Date().toISOString().split('T')[0]) // Today's records
      .order('check_in_time', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingRecord) {
      console.log('Student already checked in today')
      return new Response(
        JSON.stringify({ 
          error: 'Already checked in today', 
          student: existingRecord.students?.name || 'Unknown',
          check_in_time: existingRecord.check_in_time 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Record attendance - trigger will auto-set session_id and student_id
    console.log('Recording attendance for RFID:', rfid_code)

    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from('attendance_records')
      .insert({
        rfid_scan: rfid_code // Trigger will normalize this and set session_id/student_id
      })
      .select(`
        *,
        students(*),
        attendance_sessions(*, classes(*))
      `)
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
      student: attendanceRecord.students?.name || 'Unknown',
      session: attendanceRecord.attendance_sessions?.session_code || 'Unknown',
      time: attendanceRecord.check_in_time
    })

    return new Response(
      JSON.stringify({
        success: true,
        student: {
          name: attendanceRecord.students?.name || 'Unknown student',
          matric_number: attendanceRecord.students?.matric_number || null,
          department: attendanceRecord.students?.department || null
        },
        check_in_time: attendanceRecord.check_in_time,
        session_code: attendanceRecord.attendance_sessions?.session_code || null,
        class_name: attendanceRecord.attendance_sessions?.classes?.name || null
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