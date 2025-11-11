import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { NotificationToast } from "@/components/NotificationToast";

const StudentDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [studentId, setStudentId] = useState(null);

  // Get current student from profile
  const getCurrentStudent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("student_id")
        .eq("user_id", user.id)
        .single();

      if (profile?.student_id) {
        const { data: student } = await supabase
          .from("students")
          .select("id")
          .eq("id", profile.student_id)
          .single();
        
        return student?.id;
      }
      return null;
    } catch (error) {
      console.error("Error fetching student:", error);
      return null;
    }
  };

  // Fetch enrolled classes for student
  const fetchClasses = async (studentId) => {
    if (!studentId) return;
    
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          id,
          class_id,
          classes (
            id,
            name,
            code,
            time,
            room,
            total_students
          )
        `)
        .eq("student_id", studentId);
      
      if (error) throw error;
      const enrolledClasses = data?.map(e => e.classes) || [];
      setClasses(enrolledClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    }
  };

  // Calculate student's real attendance statistics
  const fetchAttendanceStats = async (studentId) => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select(`
          class_id,
          classes (
            id,
            name,
            code
          )
        `)
        .eq("student_id", studentId);

      if (!enrollments || enrollments.length === 0) {
        setLoading(false);
        return;
      }

      const stats = await Promise.all(
        enrollments.map(async (enrollment) => {
          const classId = enrollment.class_id;
          const className = enrollment.classes.name;
          
          // Get total sessions for this class
          const { data: sessions } = await supabase
            .from("attendance_sessions")
            .select("id")
            .eq("class_id", classId);
          
          const totalSessions = sessions?.length || 0;
          
          // Get attended sessions for this student
          const { data: attended } = await supabase
            .from("attendance_records")
            .select(`
              id,
              session_id,
              attendance_sessions!inner(class_id)
            `)
            .eq("student_id", studentId)
            .eq("attendance_sessions.class_id", classId);
          
          const presentSessions = attended?.length || 0;
          const attendancePercentage = totalSessions > 0 
            ? Math.round((presentSessions / totalSessions) * 100)
            : 0;

          return {
            subject: className,
            attendance: attendancePercentage,
            total: totalSessions,
            present: presentSessions,
            meetsRequirement: attendancePercentage >= 75
          };
        })
      );

      setAttendanceStats(stats);
      
      // Calculate overall attendance
      if (stats.length > 0) {
        const overall = Math.round(
          stats.reduce((acc, stat) => acc + stat.attendance, 0) / stats.length
        );
        setOverallAttendance(overall);
      }
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications for student
  const fetchNotifications = async (studentId) => {
    if (!studentId) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    // Check role authorization
    if (!authLoading && userRole && userRole !== 'student') {
      navigate(userRole === 'lecturer' ? '/lecturer' : '/admin');
      return;
    }
    
    const initDashboard = async () => {
      const id = await getCurrentStudent();
      setStudentId(id);
      if (id) {
        await Promise.all([
          fetchClasses(id),
          fetchAttendanceStats(id),
          fetchNotifications(id)
        ]);
      } else {
        setLoading(false);
      }
    };
    
    initDashboard();
  }, [authLoading, userRole, navigate]);

  if (loading || authLoading) {
    return (
      <>
        <NotificationToast studentId={studentId} />
        <div className="min-h-screen bg-muted/30 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NotificationToast studentId={studentId} />
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

            {/* Attendance History with Chart */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Attendance Overview
                </CardTitle>
                <CardDescription>Your attendance record by course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <>
                    {/* Attendance Chart */}
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceStats}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis 
                            dataKey="subject" 
                            tick={{ fontSize: 12 }}
                            angle={-15}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar 
                            dataKey="attendance" 
                            fill="hsl(var(--primary))"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detailed Stats */}
                    {attendanceStats.map((record, index) => (
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
                        {record.attendance < 75 && (
                          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-xs text-destructive">
                              Below 75% requirement - {75 - record.attendance}% more needed to qualify for exams
                            </p>
                          </div>
                        )}
                        {record.attendance >= 75 && record.attendance < 90 && (
                          <div className="flex items-center gap-2 p-2 bg-success/10 rounded-md">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <p className="text-xs text-success">
                              Meets 75% requirement for exam qualification
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
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
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No new notifications</p>
                    <p className="text-sm">Check back later for updates</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.is_read ? "bg-muted/50" : "bg-primary/5 border-primary/20"
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2">
                        {notification.notification_type === "schedule" && (
                          <Calendar className="h-4 w-4 text-primary mt-0.5" />
                        )}
                        {notification.notification_type === "reminder" && (
                          <Clock className="h-4 w-4 text-warning mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.created_at).toLocaleDateString()} at{" "}
                            {new Date(notification.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="h-2 w-2 bg-primary rounded-full mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))
                )}
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
    </>
  );
};

export default StudentDashboard;