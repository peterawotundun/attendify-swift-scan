import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Clock, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [presentCount, setPresentCount] = useState(0);
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch session and class data
  useEffect(() => {
    fetchSessionData();
    fetchStudents();
  }, [id]);

  const fetchSessionData = async () => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select(`
          *,
          classes (*)
        `)
        .eq('id', id)
        .single();

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

      const formattedRecords = records.map((record: any) => ({
        student: record.students,
        check_in_time: new Date(record.check_in_time).toLocaleTimeString(),
        rfid_code: record.students.rfid_code
      }));

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
          const { data: studentData, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', payload.new.student_id)
            .single();

          if (!error && studentData) {
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionData, toast]);

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
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button className="btn-success" size="sm">
                    End Session
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