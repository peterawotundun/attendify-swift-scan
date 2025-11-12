import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Calendar, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const AttendanceHistory = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select(`
          *,
          classes (
            name,
            code,
            room,
            time,
            day,
            total_students
          ),
          attendance_records (
            id,
            checkin_time,
            students (
              name,
              matric_number,
              department,
              rfid_code
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportSession = (session: any) => {
    if (!session.attendance_records || session.attendance_records.length === 0) {
      toast({
        title: "No Data",
        description: "This session has no attendance records",
        variant: "destructive",
      });
      return;
    }

    const exportData = session.attendance_records.map((record: any, index: number) => ({
      'S/N': index + 1,
      'Student Name': record.students?.name || 'Unknown',
      'Matric Number': record.students?.matric_number || 'N/A',
      'Department': record.students?.department || 'N/A',
      'RFID Code': record.students?.rfid_code || 'N/A',
      'Check-in Time': new Date(record.checkin_time).toLocaleTimeString(),
      'Status': 'Present'
    }));

    const sessionInfo = [
      { 'S/N': 'SESSION INFORMATION', 'Student Name': '', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Class Name:', 'Student Name': session.classes?.name || 'N/A', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Course Code:', 'Student Name': session.classes?.code || 'N/A', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Day:', 'Student Name': session.classes?.day || 'N/A', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Time:', 'Student Name': session.classes?.time || 'N/A', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Room:', 'Student Name': session.classes?.room || 'N/A', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Session Code:', 'Student Name': session.session_code, 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Date:', 'Student Name': new Date(session.created_at).toLocaleDateString(), 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Total Present:', 'Student Name': session.attendance_records.length.toString(), 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'Total Expected:', 'Student Name': session.classes?.total_students?.toString() || '0', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': '', 'Student Name': '', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
      { 'S/N': 'ATTENDANCE RECORDS', 'Student Name': '', 'Matric Number': '', 'Department': '', 'RFID Code': '', 'Check-in Time': '', 'Status': '' },
    ];

    const finalData = [...sessionInfo, ...exportData];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(finalData);

    worksheet['!cols'] = [
      { width: 8 },
      { width: 25 },
      { width: 15 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 10 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

    const timestamp = new Date(session.created_at).toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${session.classes?.code || 'Session'}_${session.session_code}_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);

    toast({
      title: "Export Successful",
      description: `Report exported as ${filename}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading attendance history...</p>
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
              <h1 className="text-3xl font-bold">Attendance History</h1>
              <p className="text-muted-foreground">View and export all past attendance sessions</p>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="py-8 text-center text-muted-foreground">
                No attendance sessions found
              </CardContent>
            </Card>
          ) : (
            sessions.map((session: any) => (
              <Card key={session.id} className="card-elevated">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        {session.classes?.name || "Unknown Class"}
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.is_active ? "Active" : "Completed"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.classes?.code || "N/A"}</span>
                          <span>•</span>
                          <span>Session: {session.session_code}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportSession(session)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Day</p>
                        <p className="text-sm font-medium">{session.classes?.day || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-medium">{session.classes?.time || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                        <p className="text-sm font-medium">
                          {session.attendance_records?.length || 0} / {session.classes?.total_students || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm font-medium">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${Math.min(
                          ((session.attendance_records?.length || 0) / (session.classes?.total_students || 1)) * 100,
                          100
                        )}%` 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
