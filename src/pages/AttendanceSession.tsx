import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Clock, Download } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface Student {
  id: string;
  name: string;
  matric_number: string;
  rfid_code: string;
  department: string;
}

interface AttendanceRecord {
  student: Student;
  check_in_time: string;
  rfid_code: string;
}

const AttendanceSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [presentCount, setPresentCount] = useState(0);
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEndingSession, setIsEndingSession] = useState(false);

  // Fetch session and class data
  useEffect(() => {
    fetchSessionData();
    fetchStudents();
  }, [id]);

  const fetchSessionData = async () => {
    try {
      // Validate if id is a proper UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      let sessionQuery;
      
      if (uuidRegex.test(id || '')) {
        // If it's a UUID, query by ID
        sessionQuery = supabase
          .from('attendance_sessions')
          .select(`
            *,
            classes (*)
          `)
          .eq('id', id)
          .maybeSingle();
      } else {
        // If it's not a UUID, try to find by session_code or get the first active session
        sessionQuery = supabase
          .from('attendance_sessions')
          .select(`
            *,
            classes (*)
          `)
          .or(`session_code.eq.${id},session_code.eq.ATD-2024-00${id}`)
          .eq('is_active', true)
          .maybeSingle();
      }

      const { data: session, error: sessionError } = await sessionQuery;

      if (sessionError) throw sessionError;

      setSessionData(session);
      setClassData(session.classes);
      
      // Fetch existing attendance records for this session
      const { data: records, error: recordsError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          students (*)
        `)
        .eq('session_id', session.id)
        .order('check_in_time', { ascending: false });

      if (recordsError) throw recordsError;

      const formattedRecords: AttendanceRecord[] = await Promise.all(
        (records || []).map(async (record: any) => {
          let student = record.students as Student | null;

          if (!student) {
            // Fallback: resolve student from rfid_scan
            const { data: fallbackStudent } = await supabase
              .from('students')
              .select('*')
              .eq('rfid_code', record.rfid_scan)
              .maybeSingle();

            if (fallbackStudent) {
              student = fallbackStudent as Student;
              // Try to backfill student_id on the record for future queries
              await supabase
                .from('attendance_records')
                .update({ student_id: fallbackStudent.id })
                .eq('id', record.id);
            } else {
              // Check profiles table for user who created account with this RFID
              const { data: profileStudent } = await supabase
                .from('profiles')
                .select('*')
                .eq('rfid_code', record.rfid_scan)
                .maybeSingle();

              if (profileStudent) {
                // Create student object from profile data
                student = {
                  id: profileStudent.id,
                  name: profileStudent.full_name,
                  matric_number: profileStudent.matric_number,
                  rfid_code: profileStudent.rfid_code,
                  department: profileStudent.department,
                } as Student;
              } else {
                // Graceful placeholder if not resolvable
                student = {
                  id: 'unknown',
                  name: 'Unknown Student',
                  matric_number: 'N/A',
                  rfid_code: record.rfid_scan,
                  department: 'N/A',
                } as Student;
              }
            }
          }

          return {
            student,
            check_in_time: new Date(record.check_in_time).toLocaleTimeString(),
            rfid_code: student.rfid_code,
          } as AttendanceRecord;
        })
      );

      setRecentScans(formattedRecords);
      setPresentCount(records.length);
    } catch (error) {
      console.error('Error fetching session data:', error);
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Real-time listener for new attendance records
  useEffect(() => {
    if (!sessionData) return;

    const channel = supabase
      .channel('attendance-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_records',
          filter: `session_id=eq.${sessionData.id}`
        },
        async (payload) => {
          // Fetch the student data for the new record
          let studentData = null as Student | null;

          if (payload.new.student_id) {
            const { data, error } = await supabase
              .from('students')
              .select('*')
              .eq('id', payload.new.student_id)
              .maybeSingle();
            if (!error) studentData = data as Student | null;
          }

          // Fallback: resolve by RFID if student_id is missing
          if (!studentData && payload.new.rfid_scan) {
            const { data: fallbackStudent } = await supabase
              .from('students')
              .select('*')
              .eq('rfid_code', payload.new.rfid_scan)
              .maybeSingle();

            if (fallbackStudent) {
              studentData = fallbackStudent as Student;
              // Try to backfill the record for future queries
              await supabase
                .from('attendance_records')
                .update({ student_id: fallbackStudent.id })
                .eq('id', payload.new.id);
            } else {
              // Check profiles table for user who created account with this RFID
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('rfid_code', payload.new.rfid_scan)
                .maybeSingle();

              if (profileData) {
                // Create student object from profile data
                studentData = {
                  id: profileData.id,
                  name: profileData.full_name,
                  matric_number: profileData.matric_number,
                  rfid_code: profileData.rfid_code,
                  department: profileData.department,
                } as Student;
              }
            }
          }

          if (studentData) {
            const newRecord: AttendanceRecord = {
              student: studentData,
              check_in_time: new Date(payload.new.check_in_time).toLocaleTimeString(),
              rfid_code: studentData.rfid_code
            };

            setRecentScans(prev => [newRecord, ...prev]);
            setPresentCount(prev => prev + 1);

            toast({
              title: "Check-in Successful",
              description: `${studentData.name} (${studentData.matric_number}) checked in`,
            });
          } else {
            // Show a minimal entry so the feed reflects activity
            const newRecord: AttendanceRecord = {
              student: {
                id: 'unknown',
                name: 'Unknown Student',
                matric_number: 'N/A',
                rfid_code: payload.new.rfid_scan,
                department: 'N/A',
              },
              check_in_time: new Date(payload.new.check_in_time).toLocaleTimeString(),
              rfid_code: payload.new.rfid_scan,
            };
            setRecentScans(prev => [newRecord, ...prev]);
            setPresentCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionData, toast]);

  // End session functionality
  const handleEndSession = async () => {
    if (!sessionData) return;
    
    setIsEndingSession(true);
    try {
      const { error } = await supabase
        .from("attendance_sessions")
        .update({ 
          is_active: false,
          end_time: new Date().toISOString()
        })
        .eq("id", sessionData.id);

      if (error) throw error;

      toast({
        title: "Session Ended",
        description: "Attendance session has been successfully ended",
      });

      // Navigate back to lecturer dashboard
      navigate("/lecturer");
    } catch (error) {
      console.error("Error ending session:", error);
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    } finally {
      setIsEndingSession(false);
    }
  };

  // Export to Excel functionality
  const handleExport = () => {
    if (!recentScans.length || !sessionData || !classData) {
      toast({
        title: "No Data",
        description: "No attendance data to export",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for Excel export
    const exportData = recentScans.map((scan, index) => ({
      'S/N': index + 1,
      'Student Name': scan.student.name,
      'Matric Number': scan.student.matric_number,
      'Department': scan.student.department,
      'RFID Code': scan.rfid_code,
      'Check-in Time': scan.check_in_time,
      'Status': 'Present'
    }));

    // Add session info at the top
    const sessionInfo = [
      { 'S/N': 'CLASS INFORMATION', 'Student Name': '', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Class Name:', 'Student Name': classData.name, 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Course Code:', 'Student Name': classData.code, 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Room:', 'Student Name': classData.room, 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Time:', 'Student Name': classData.time, 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Session Code:', 'Student Name': sessionData.session_code, 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Date:', 'Student Name': new Date().toLocaleDateString(), 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Total Present:', 'Student Name': presentCount.toString(), 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Total Enrolled:', 'Student Name': classData.total_students.toString(), 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Attendance Rate:', 'Student Name': `${Math.round((presentCount / classData.total_students) * 100)}%`, 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': '', 'Student Name': '', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'ATTENDANCE RECORDS', 'Student Name': '', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
    ];

    const finalData = [...sessionInfo, ...exportData];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(finalData);

    // Set column widths
    worksheet['!cols'] = [
      { width: 8 },   // S/N
      { width: 25 },  // Student Name
      { width: 15 },  // Matric Number
      { width: 20 },  // Department
      { width: 15 },  // RFID Code
      { width: 15 },  // Check-in Time
      { width: 10 }   // Status
    ];

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${classData.code}_${sessionData.session_code}_Attendance_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, filename);

    toast({
      title: "Export Successful",
      description: `Attendance report exported as ${filename}`,
    });
  };

  // This function is called by the RFID hardware via the edge function
  // The edge function handles all the logic and database updates

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session data...</p>
        </div>
      </div>
    );
  }

  if (!sessionData || !classData) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">The attendance session could not be loaded.</p>
          <Button asChild>
            <Link to="/lecturer">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/lecturer">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Attendance Session</h1>
              <p className="text-muted-foreground">Live RFID attendance tracking</p>
            </div>
          </div>
          <StatusIndicator connected={true} label="RFID Reader" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Session Info */}
          <div className="lg:col-span-1">
            <Card className="card-elevated mb-6">
              <CardHeader>
                <CardTitle>Class Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{classData.name}</h3>
                  <p className="text-muted-foreground">{classData.code}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{classData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span className="font-medium">{classData.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Students:</span>
                    <span className="font-medium">{classData.total_students}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated mb-6">
              <CardHeader>
                <CardTitle>Session Code</CardTitle>
                <CardDescription>For manual check-in backup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{sessionData.session_code}</div>
                  <p className="text-xs text-muted-foreground">
                    Students can use this code for manual check-in
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Attendance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-success">{presentCount}</div>
                  <p className="text-muted-foreground">
                    of {classData.total_students} students present
                  </p>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-success h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(presentCount / classData.total_students) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((presentCount / classData.total_students) * 100)}% attendance rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Scan Feed */}
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Live RFID Scan Feed</CardTitle>
                  <CardDescription>Real-time student check-ins</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExport}
                    disabled={recentScans.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button 
                    className="btn-success" 
                    size="sm"
                    onClick={handleEndSession}
                    disabled={isEndingSession || !sessionData?.is_active}
                  >
                    {isEndingSession ? "Ending..." : "End Session"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentScans.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Waiting for RFID card scans...</p>
                    <p className="text-sm">Students should tap their ID cards on the RFID reader</p>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Session Code: {sessionData?.session_code}</p>
                      <p className="text-xs text-muted-foreground">Use this code for manual check-in if RFID fails</p>
                    </div>
                  </div>
                  ) : (
                    recentScans.map((scan, index) => (
                      <div 
                        key={`${scan.student.id}-${scan.check_in_time}`} 
                        className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                          index === 0 ? 'bg-success/10 border-success/20' : 'bg-card'
                        }`}
                      >
                        <Avatar>
                          <AvatarFallback>
                            {scan.student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{scan.student.name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {scan.student.matric_number}</p>
                          <p className="text-xs text-muted-foreground">RFID: {scan.rfid_code}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{scan.check_in_time}</span>
                          </div>
                          {index === 0 && (
                            <Badge className="mt-1 bg-success text-success-foreground">
                              Just checked in
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSession;