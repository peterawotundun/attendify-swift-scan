import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get current time and time 30 minutes from now
    const now = new Date()
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000)
    
    console.log('Checking for sessions starting at:', thirtyMinutesFromNow.toISOString())

    // Find attendance sessions starting in approximately 30 minutes
    const { data: upcomingSessions, error: sessionsError } = await supabaseClient
      .from('attendance_sessions')
      .select(`
        id,
        start_time,
        class_id,
        classes (
          id,
          code,
          name,
          time,
          room
        )
      `)
      .eq('is_active', true)
      .gte('start_time', now.toISOString())
      .lte('start_time', thirtyMinutesFromNow.toISOString())

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    console.log(`Found ${upcomingSessions?.length || 0} upcoming sessions`)

    if (!upcomingSessions || upcomingSessions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No sessions starting in the next 30 minutes',
          checked_at: now.toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let totalNotificationsSent = 0

    // Process each upcoming session
    for (const session of upcomingSessions) {
      const classInfo = session.classes

      // Get all enrolled students for this class
      const { data: enrollments, error: enrollError } = await supabaseClient
        .from('course_enrollments')
        .select('student_id')
        .eq('class_id', session.class_id)

      if (enrollError) {
        console.error('Error fetching enrollments:', enrollError)
        continue
      }

      if (!enrollments || enrollments.length === 0) {
        console.log(`No students enrolled in ${classInfo.code}`)
        continue
      }

      console.log(`Sending reminders to ${enrollments.length} students for ${classInfo.code}`)

      // Create reminder notifications for each enrolled student
      const notifications = enrollments.map(enrollment => ({
        student_id: enrollment.student_id,
        class_id: session.class_id,
        message: `Reminder: ${classInfo.name} (${classInfo.code}) starts in 30 minutes at ${classInfo.time} in room ${classInfo.room}`,
        notification_type: 'reminder',
        scheduled_time: session.start_time,
      }))

      const { error: notifyError } = await supabaseClient
        .from('notifications')
        .insert(notifications)

      if (notifyError) {
        console.error('Error creating notifications:', notifyError)
      } else {
        totalNotificationsSent += notifications.length
        console.log(`Created ${notifications.length} reminder notifications for session ${session.id}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sessions_processed: upcomingSessions.length,
        notifications_sent: totalNotificationsSent,
        checked_at: now.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in send-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
