import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Users, Clock, Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const AttendanceSession = () => {
  const { id } = useParams();
  const [sessionCode] = useState("ATD-2024-001");
  const [presentCount, setPresentCount] = useState(0);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Mock class data
  const classInfo = {
    name: "Data Structures",
    code: "CS201",
    time: "10:00 AM - 11:30 AM",
    room: "A101",
    totalStudents: 45
  };

  // Simulate real-time RFID scans
  useEffect(() => {
    const mockStudents = [
      { id: "STU001", name: "Alice Johnson", avatar: "" },
      { id: "STU002", name: "Bob Smith", avatar: "" },
      { id: "STU003", name: "Carol Davis", avatar: "" },
      { id: "STU004", name: "David Wilson", avatar: "" },
      { id: "STU005", name: "Emily Brown", avatar: "" }
    ];

    let scanIndex = 0;
    const interval = setInterval(() => {
      if (scanIndex < mockStudents.length) {
        const student = mockStudents[scanIndex];
        const newScan = {
          ...student,
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now()
        };
        
        setRecentScans(prev => [newScan, ...prev]);
        setPresentCount(prev => prev + 1);
        scanIndex++;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
                  <h3 className="font-semibold text-lg">{classInfo.name}</h3>
                  <p className="text-muted-foreground">{classInfo.code}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{classInfo.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span className="font-medium">{classInfo.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Students:</span>
                    <span className="font-medium">{classInfo.totalStudents}</span>
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
                  <div className="text-3xl font-bold text-primary mb-2">{sessionCode}</div>
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
                    of {classInfo.totalStudents} students present
                  </p>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-success h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(presentCount / classInfo.totalStudents) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((presentCount / classInfo.totalStudents) * 100)}% attendance rate
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
                      <p>Waiting for student check-ins...</p>
                      <p className="text-sm">Students can tap their ID cards on the RFID reader</p>
                    </div>
                  ) : (
                    recentScans.map((scan, index) => (
                      <div 
                        key={scan.timestamp} 
                        className={`flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 ${
                          index === 0 ? 'bg-success/10 border-success/20' : 'bg-card'
                        }`}
                      >
                        <Avatar>
                          <AvatarImage src={scan.avatar} />
                          <AvatarFallback>
                            {scan.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium">{scan.name}</h4>
                          <p className="text-sm text-muted-foreground">ID: {scan.id}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{scan.time}</span>
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