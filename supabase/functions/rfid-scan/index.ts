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
    
    console.log('Received RFID scan:', { rfid_code, api_key })

    // Validate API key
    const validApiKey = Deno.env.get('RFID_API_KEY') || 'your-hardware-api-key'
    if (api_key !== validApiKey) {
      console.log('Invalid API key provided:', api_key)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!rfid_code) {
      return new Response(
        JSON.stringify({ error: 'RFID code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for existing attendance record with same RFID in recent time (prevent duplicates)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentRecord } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('rfid_scan', rfid_code)
      .gte('check_in_time', fiveMinutesAgo)
      .maybeSingle()

    if (recentRecord) {
      console.log('Duplicate scan detected within 5 minutes')
      return new Response(
        JSON.stringify({ 
          error: 'Already scanned recently',
          check_in_time: recentRecord.check_in_time 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert attendance record - trigger will handle setting session_id and student_id
    console.log('Recording attendance for RFID:', rfid_code)
    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from('attendance_records')
      .insert({
        rfid_scan: rfid_code
      })
      .select(`
        *,
        students!inner(name, matric_number, department),
        attendance_sessions!inner(session_code, classes!inner(name, code, room))
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

    // Return complete details
    const response = {
      success: true,
      student: {
        name: attendanceRecord.students?.name || 'Unknown Student',
        matric_number: attendanceRecord.students?.matric_number || 'Unknown',
        department: attendanceRecord.students?.department || 'Unknown'
      },
      session: {
        code: attendanceRecord.attendance_sessions?.session_code || 'Unknown Session',
        class_name: attendanceRecord.attendance_sessions?.classes?.name || 'Unknown Class',
        class_code: attendanceRecord.attendance_sessions?.classes?.code || 'Unknown',
        room: attendanceRecord.attendance_sessions?.classes?.room || 'Unknown'
      },
      check_in_time: attendanceRecord.check_in_time,
      rfid_code: attendanceRecord.rfid_scan
    }

    console.log('Successful attendance recorded:', response)

    return new Response(
      JSON.stringify(response),
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