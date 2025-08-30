/// <reference lib="deno.unstable" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { rfid_code, session_code, api_key } = await req.json();

    // Validate API key
    const validApiKey = Deno.env.get("RFID_API_KEY") || "your-hardware-api-key";
    if (api_key !== validApiKey) {
      console.log("Invalid API key provided:", api_key);
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("RFID scan request:", { rfid_code, session_code });

    // 1. Lookup student by RFID in students table
    let { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("rfid_code", rfid_code)
      .single();

    // 2. If not found in students, try profiles table
    if (studentError || !student) {
      const { data: profileStudent, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("rfid_code", rfid_code)
        .single();

      if (profileStudent && !profileError) {
        student = {
          id: profileStudent.student_id || profileStudent.id,
          name: profileStudent.full_name,
          matric_number: profileStudent.matric_number,
          rfid_code: profileStudent.rfid_code,
          department: profileStudent.department,
        };
      }
    }

    // 3. Find active session by session_code (attendance_sessions)
    const { data: session, error: sessionError } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("session_code", session_code)
      .eq("is_active", true)
      .single();

    if (sessionError || !session) {
      console.log("Active session not found:", session_code);
      return new Response(
        JSON.stringify({ error: "Active session not found", session_code }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Check if already checked in
    let existingRecord = null;
    if (student && student.id) {
      const { data } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("session_id", session.id)
        .eq("student_id", student.id)
        .single();
      existingRecord = data;
    }

    if (existingRecord) {
      console.log("Student already checked in:", student.name);
      return new Response(
        JSON.stringify({
          error: "Already checked in",
          student: student.name,
          check_in_time: existingRecord.check_in_time,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Record attendance (handles unknown student too)
    let insertData: any = {
      session_id: session.id,
      rfid_scan: rfid_code,
    };
    if (student && student.id) {
      insertData.student_id = student.id;
    }

    const { data: attendanceRecord, error: attendanceError } = await supabase
      .from("attendance_records")
      .insert(insertData)
      .select("*")
      .single();

    if (attendanceError) {
      console.error("Error recording attendance:", attendanceError);
      return new Response(
        JSON.stringify({ error: "Failed to record attendance" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success response
    console.log("Attendance recorded successfully:", {
      student: student ? student.name : "Unknown Student",
      session: session_code,
      time: attendanceRecord.check_in_time,
    });

    return new Response(
      JSON.stringify({
        success: true,
        student: student
          ? {
              name: student.name,
              matric_number: student.matric_number,
              department: student.department,
            }
          : {
              name: "Unknown Student",
              matric_number: "N/A",
              department: "N/A",
            },
        check_in_time: attendanceRecord.check_in_time,
        session_code: session_code,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in RFID scan function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
