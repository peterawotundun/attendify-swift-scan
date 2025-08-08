import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { 
  Users, 
  BookOpen, 
  Wifi, 
  TrendingUp, 
  Download, 
  Settings,
  ArrowLeft,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const systemStats = {
    totalStudents: 1245,
    totalLecturers: 89,
    activeSessions: 12,
    totalScans: 2847
  };

  const deviceStatus = [
    { id: 1, location: "Room A101", status: "connected", lastPing: "2 min ago" },
    { id: 2, location: "Room A102", status: "connected", lastPing: "1 min ago" },
    { id: 3, location: "Room B205", status: "disconnected", lastPing: "25 min ago" },
    { id: 4, location: "Room C102", status: "connected", lastPing: "3 min ago" },
    { id: 5, location: "Room D301", status: "maintenance", lastPing: "1 hour ago" }
  ];

  const attendanceTrends = [
    { period: "This Week", rate: 87, change: "+3%" },
    { period: "This Month", rate: 84, change: "+1%" },
    { period: "This Semester", rate: 86, change: "+5%" }
  ];

  const recentActivities = [
    { id: 1, type: "session_start", message: "CS201 - Data Structures session started", user: "Dr. Smith", time: "5 min ago" },
    { id: 2, type: "device_offline", message: "RFID Reader in Room B205 went offline", time: "25 min ago" },
    { id: 3, type: "high_attendance", message: "CS301 - Algorithms achieved 98% attendance", user: "Dr. Johnson", time: "1 hour ago" },
    { id: 4, type: "export", message: "Monthly attendance report exported", user: "Admin", time: "2 hours ago" }
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">System overview and management</p>
            </div>
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
                  {attendanceTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{trend.period}</h4>
                        <p className="text-sm text-muted-foreground">Average attendance rate</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{trend.rate}%</div>
                        <Badge className="bg-success text-success-foreground">
                          {trend.change}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                    {activity.user && (
                      <p className="text-xs text-muted-foreground">by {activity.user}</p>
                    )}
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
    </div>
  );
};

export default AdminDashboard;