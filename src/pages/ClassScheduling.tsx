import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";

const ClassScheduling = () => {
  const [repeatWeekly, setRepeatWeekly] = useState(false);

  const existingSchedules = [
    {
      id: 1,
      courseName: "Data Structures",
      courseCode: "CS201",
      time: "10:00 AM - 11:30 AM",
      days: ["Monday", "Wednesday", "Friday"],
      room: "A101",
      students: 45,
      status: "active"
    },
    {
      id: 2,
      courseName: "Algorithms",
      courseCode: "CS301",
      time: "2:00 PM - 3:30 PM",
      days: ["Tuesday", "Thursday"],
      room: "B205",
      students: 38,
      status: "active"
    },
    {
      id: 3,
      courseName: "Database Systems",
      courseCode: "CS401",
      time: "4:00 PM - 5:30 PM",
      days: ["Monday", "Wednesday"],
      room: "C102",
      students: 52,
      status: "draft"
    }
  ];

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
              <h1 className="text-3xl font-bold">Class Scheduling</h1>
              <p className="text-muted-foreground">Manage your course schedules and sessions</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create New Schedule Form */}
          <div className="lg:col-span-1">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Schedule
                </CardTitle>
                <CardDescription>Set up a new class schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input id="course-name" placeholder="e.g., Data Structures" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input id="course-code" placeholder="e.g., CS201" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input id="start-time" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input id="end-time" type="time" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a101">A101</SelectItem>
                      <SelectItem value="a102">A102</SelectItem>
                      <SelectItem value="b205">B205</SelectItem>
                      <SelectItem value="c102">C102</SelectItem>
                      <SelectItem value="d301">D301</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="days">Days of Week</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mwf">Monday, Wednesday, Friday</SelectItem>
                      <SelectItem value="tth">Tuesday, Thursday</SelectItem>
                      <SelectItem value="daily">Monday to Friday</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="repeat-weekly" 
                    checked={repeatWeekly}
                    onCheckedChange={setRepeatWeekly}
                  />
                  <Label htmlFor="repeat-weekly">Repeat Weekly</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-students">Maximum Students</Label>
                  <Input id="max-students" type="number" placeholder="e.g., 50" />
                </div>

                <Button className="w-full btn-primary">
                  Create Schedule
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Existing Schedules */}
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Existing Schedules</CardTitle>
                <CardDescription>Manage your current course schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {existingSchedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{schedule.courseName}</h3>
                            <Badge variant="outline">{schedule.courseCode}</Badge>
                            <Badge 
                              variant={schedule.status === "active" ? "default" : "secondary"}
                              className={schedule.status === "active" ? "bg-success text-success-foreground" : ""}
                            >
                              {schedule.status === "active" ? "Active" : "Draft"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{schedule.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>Room {schedule.room}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{schedule.days.join(", ")}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{schedule.students} students</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          Next session: Tomorrow at {schedule.time.split(" - ")[0]}
                        </div>
                        <Button className="btn-success" size="sm" asChild>
                          <Link to={`/session/${schedule.id}`}>
                            Start Session
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="card-elevated mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col h-20 space-y-2">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">View Calendar</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 space-y-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Manage Students</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 space-y-2">
                    <MapPin className="h-6 w-6" />
                    <span className="text-sm">Room Booking</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-20 space-y-2">
                    <Clock className="h-6 w-6" />
                    <span className="text-sm">Time Slots</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassScheduling;
