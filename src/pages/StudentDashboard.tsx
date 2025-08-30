import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Bell, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallAttendance, setOverallAttendance] = useState(0);

  // Fetch all available classes
  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    }
  };

  // Calculate student's attendance statistics
  const fetchAttendanceStats = async () => {
    try {
      // Get all classes with their attendance data
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          attendance_sessions (
            id,
            attendance_records (
              id,
              student_id
            )
          )
        `);

      if (classesError) throw classesError;

      // For demo purposes, generate mock attendance data since we don't have real student data yet
      const stats = classesData?.map(cls => {
        const totalSessions = cls.attendance_sessions.length || 1;
        // Generate random but realistic attendance percentage
        const attendanceRate = Math.floor(Math.random() * 30) + 70; // 70-100%
        const presentSessions = Math.round((attendanceRate / 100) * totalSessions);
        
        return {
          subject: cls.name,
          attendance: attendanceRate,
          total: totalSessions,
          present: presentSessions
        };
      }) || [];

      setAttendanceStats(stats);
      
      // Calculate overall attendance
      if (stats.length > 0) {
        const overall = Math.round(stats.reduce((acc, stat) => acc + stat.attendance, 0) / stats.length);
        setOverallAttendance(overall);
      }
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAttendanceStats();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Student Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, John Doe</p>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            ID: STU2024001
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Classes */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Available Classes
                </CardTitle>
                <CardDescription>Classes you can attend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading classes...</p>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">No classes available yet</div>
                  </div>
                ) : (
                  classes.map((class_) => (
                    <div key={class_.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{class_.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {class_.code} • {class_.time} • Room {class_.room}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {class_.total_students} students enrolled
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          Available
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Attendance History */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Attendance Overview
                </CardTitle>
                <CardDescription>Your attendance record by course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading attendance...</p>
                  </div>
                ) : attendanceStats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No attendance data available yet</p>
                    <p className="text-sm">Attend some classes to see your statistics</p>
                  </div>
                ) : (
                  attendanceStats.map((record, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{record.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {record.present} of {record.total} classes attended
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{record.attendance}%</div>
                          <Badge 
                            variant={record.attendance >= 90 ? "default" : record.attendance >= 75 ? "secondary" : "destructive"}
                            className={record.attendance >= 90 ? "bg-success text-success-foreground" : ""}
                          >
                            {record.attendance >= 90 ? "Excellent" : record.attendance >= 75 ? "Good" : "Warning"}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={record.attendance} className="h-2" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4">
              <Card className="card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-medium">Overall Attendance</span>
                  </div>
                  <div className="text-3xl font-bold text-success">{overallAttendance}%</div>
                  <p className="text-sm text-muted-foreground">Above minimum requirement</p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">Enrolled Courses</span>
                  </div>
                  <div className="text-3xl font-bold">{classes.length}</div>
                  <p className="text-sm text-muted-foreground">Current semester</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No new notifications</p>
                  <p className="text-sm">Check back later for updates</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-primary">
                  Manual Check-in
                </Button>
                <Button variant="outline" className="w-full">
                  View Full Schedule
                </Button>
                <Button variant="outline" className="w-full">
                  Attendance Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;