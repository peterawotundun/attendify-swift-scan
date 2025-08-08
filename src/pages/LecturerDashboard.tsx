import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusIndicator } from "@/components/StatusIndicator";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Plus, 
  Calendar, 
  Users, 
  Settings, 
  Play,
  Clock,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const LecturerDashboard = () => {
  const upcomingClasses = [
    { id: 1, name: "Data Structures", code: "CS201", time: "10:00 AM", room: "A101", students: 45 },
    { id: 2, name: "Algorithms", code: "CS301", time: "2:00 PM", room: "B205", students: 38 },
    { id: 3, name: "Database Systems", code: "CS401", time: "4:00 PM", room: "C102", students: 52 }
  ];

  const attendanceStats = [
    { subject: "Data Structures", attendance: 85 },
    { subject: "Algorithms", attendance: 92 },
    { subject: "Database Systems", attendance: 78 }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="w-64">
          <SidebarContent className="p-4">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-primary">Attendify</h2>
              <p className="text-sm text-muted-foreground">Lecturer Dashboard</p>
            </div>
            
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/lecturer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/schedule">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Class
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Attendance
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Dr. Smith</h1>
              <p className="text-muted-foreground">Here's what's happening with your classes today</p>
            </div>
            <StatusIndicator connected={true} label="RFID Reader" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Quick Stats */}
            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  2 completed, 1 upcoming
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last week
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">135</div>
                <p className="text-xs text-muted-foreground">
                  Across all courses
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming Classes */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>Your scheduled classes for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingClasses.map((class_) => (
                  <div key={class_.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{class_.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {class_.code} • {class_.time} • Room {class_.room}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {class_.students} students enrolled
                      </p>
                    </div>
                    <Button className="btn-success" asChild>
                      <Link to={`/session/${class_.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Session
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Attendance Overview */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Attendance Statistics</CardTitle>
                <CardDescription>Recent attendance rates by course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {attendanceStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{stat.subject}</span>
                      <span className="font-medium">{stat.attendance}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${stat.attendance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LecturerDashboard;