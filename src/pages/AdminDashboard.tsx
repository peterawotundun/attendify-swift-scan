import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { 
  Users, 
  BookOpen, 
  Wifi, 
  TrendingUp, 
  Download, 
  Settings,
  AlertTriangle,
  CheckCircle,
  LayoutDashboard,
  UserPlus,
  Calendar,
  FileText,
  Shield
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userRole, loading: authLoading } = useAuth();
  const [systemStats, setSystemStats] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    activeSessions: 0,
    totalScans: 0
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSystemStats = async () => {
    try {
      // Get total profiles (students/lecturers)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      // Get total classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*');

      // Get active sessions
      const { data: activeSessions, error: sessionsError } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('is_active', true);

      // Get today's attendance records
      const today = new Date().toISOString().split('T')[0];
      const { data: todaysScans, error: scansError } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('check_in_time', `${today}T00:00:00.000Z`)
        .lt('check_in_time', `${today}T23:59:59.999Z`);

      if (!profilesError && !classesError && !sessionsError && !scansError) {
        setSystemStats({
          totalStudents: profiles?.length || 0,
          totalLecturers: classesData?.length || 0, // Using classes as proxy for lecturers
          activeSessions: activeSessions?.length || 0,
          totalScans: todaysScans?.length || 0
        });
        setClasses(classesData || []);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const { data: attendanceData, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          attendance_sessions!inner(
            class_id,
            classes!inner(name)
          )
        `);

      if (!error && attendanceData) {
        // Calculate attendance statistics
        const classStats = attendanceData.reduce((acc: any, record: any) => {
          const className = record.attendance_sessions.classes.name;
          if (!acc[className]) {
            acc[className] = { total: 0, attended: 0 };
          }
          acc[className].total += 1;
          acc[className].attended += 1;
          return acc;
        }, {});

        const statsArray = Object.entries(classStats).map(([name, stats]: [string, any]) => ({
          name,
          rate: Math.round((stats.attended / stats.total) * 100) || 0
        }));

        setAttendanceStats(statsArray);
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  useEffect(() => {
    // Check role authorization
    if (!authLoading && userRole && userRole !== 'admin') {
      navigate(userRole === 'student' ? '/student' : '/lecturer');
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSystemStats(), fetchAttendanceStats()]);
      setLoading(false);
    };
    
    loadData();
  }, [authLoading, userRole, navigate]);

  const attendanceTrends = [
    { period: "This Week", rate: 87, change: "+3%" },
    { period: "This Month", rate: 84, change: "+1%" },
    { period: "This Semester", rate: 86, change: "+5%" }
  ];

  const deviceStatus = classes.map((classItem, index) => ({
    id: classItem.id,
    location: classItem.room,
    status: index % 3 === 0 ? "connected" : index % 3 === 1 ? "connected" : "disconnected",
    lastPing: index % 3 === 0 ? "2 min ago" : index % 3 === 1 ? "1 min ago" : "25 min ago"
  }));

  const recentActivities = [
    { id: 1, type: "session_start", message: "New attendance session started", time: "5 min ago" },
    { id: 2, type: "device_offline", message: "RFID Reader maintenance check", time: "25 min ago" },
    { id: 3, type: "high_attendance", message: "High attendance rate achieved", time: "1 hour ago" },
    { id: 4, type: "export", message: "Data report exported", time: "2 hours ago" }
  ];

  const sidebarItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { title: "User Management", icon: Users, href: "/admin/users" },
    { title: "Reports", icon: FileText, href: "/admin/reports" },
    { title: "Settings", icon: Settings, href: "/admin" },
  ];

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar>
            <SidebarContent>
              <div className="p-4">
                <div className="flex items-center" style={{ gap: '3px' }}>
                  <img src="/lovable-uploads/2e759af7-37bc-4e5f-9c0b-3aaed75ff12f.png" alt="Attendify Logo" className="h-8 w-auto" />
                  <h2 className="text-lg font-semibold text-primary">Attendify</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Admin Portal</p>
              </div>
              <SidebarMenu>
                {sidebarItems.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href} className="flex items-center space-x-3 p-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 p-6 bg-muted/30">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading dashboard data...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4">
              <div className="flex items-center" style={{ gap: '3px' }}>
                <img src="/lovable-uploads/2e759af7-37bc-4e5f-9c0b-3aaed75ff12f.png" alt="Attendify Logo" className="h-8 w-auto" />
                <h2 className="text-lg font-semibold text-primary">Attendify</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Admin Portal</p>
            </div>
            <SidebarMenu>
              {sidebarItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <Link to={item.href} className="flex items-center space-x-3 p-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">System overview and management</p>
              </div>
              <div className="flex items-center space-x-4">
                <StatusIndicator connected={true} label="System Status" />
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Active registrations</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalLecturers}</div>
              <p className="text-xs text-muted-foreground">Teaching staff</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Scans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalScans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">RFID check-ins</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Device Management */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>RFID Device Status</CardTitle>
                  <CardDescription>Monitor connected readers across campus</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deviceStatus.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          device.status === "connected" ? "bg-success" : 
                          device.status === "disconnected" ? "bg-destructive" : "bg-orange-500"
                        }`} />
                        <div>
                          <h4 className="font-medium">{device.location}</h4>
                          <p className="text-sm text-muted-foreground">Last ping: {device.lastPing}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={device.status === "connected" ? "default" : "destructive"}
                        className={device.status === "connected" ? "bg-success text-success-foreground" : ""}
                      >
                        {device.status === "connected" ? "Online" : 
                         device.status === "disconnected" ? "Offline" : "Maintenance"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
                <CardDescription>System-wide attendance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceStats.length > 0 ? (
                    attendanceStats.slice(0, 3).map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{stat.name}</h4>
                          <p className="text-sm text-muted-foreground">Class attendance rate</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{stat.rate}%</div>
                          <Badge className="bg-success text-success-foreground">
                            Active
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No attendance data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">RFID Network</span>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">1 Issue</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="border-l-2 border-primary/20 pl-3 pb-3">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full btn-primary">
                  Export All Data
                </Button>
                <Button variant="outline" className="w-full">
                  System Backup
                </Button>
                <Button variant="outline" className="w-full">
                  User Management
                </Button>
                <Button variant="outline" className="w-full">
                  Device Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;