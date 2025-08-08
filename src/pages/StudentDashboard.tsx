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

const StudentDashboard = () => {
  const upcomingClasses = [
    { 
      id: 1, 
      name: "Data Structures", 
      code: "CS201", 
      time: "10:00 AM", 
      room: "A101", 
      status: "upcoming",
      timeLeft: "2h 15m"
    },
    { 
      id: 2, 
      name: "Algorithms", 
      code: "CS301", 
      time: "2:00 PM", 
      room: "B205", 
      status: "later",
      timeLeft: "6h 15m"
    }
  ];

  const attendanceHistory = [
    { subject: "Data Structures", attendance: 92, total: 25, present: 23 },
    { subject: "Algorithms", attendance: 88, total: 22, present: 19 },
    { subject: "Database Systems", attendance: 96, total: 20, present: 19 },
    { subject: "Web Development", attendance: 85, total: 18, present: 15 }
  ];

  const notifications = [
    { id: 1, type: "session", message: "Data Structures session starting in 2 hours", time: "2h" },
    { id: 2, type: "missed", message: "You missed yesterday's Algorithms class", time: "1d" },
    { id: 3, type: "reminder", message: "Assignment due tomorrow for Web Development", time: "1d" }
  ];

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
            {/* Upcoming Classes */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Today's Classes
                </CardTitle>
                <CardDescription>Your scheduled classes for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingClasses.map((class_) => (
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
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{class_.timeLeft}</span>
                      </div>
                      <Badge 
                        variant={class_.status === "upcoming" ? "default" : "secondary"}
                        className={class_.status === "upcoming" ? "bg-success text-success-foreground" : ""}
                      >
                        {class_.status === "upcoming" ? "Starting Soon" : "Later Today"}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                {attendanceHistory.map((record, index) => (
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
                ))}
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
                  <div className="text-3xl font-bold text-success">90%</div>
                  <p className="text-sm text-muted-foreground">Above minimum requirement</p>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">Enrolled Courses</span>
                  </div>
                  <div className="text-3xl font-bold">4</div>
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
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <div className="mt-1">
                      {notification.type === "session" && <Clock className="h-4 w-4 text-primary" />}
                      {notification.type === "missed" && <AlertCircle className="h-4 w-4 text-destructive" />}
                      {notification.type === "reminder" && <Bell className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time} ago</p>
                    </div>
                  </div>
                ))}
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