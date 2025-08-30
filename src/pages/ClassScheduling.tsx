import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ClassScheduling = () => {
  // Controlled form state
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [room, setRoom] = useState("");
  const [time, setTime] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Classes fetched from DB
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  // Fetch classes from DB
  const fetchClasses = async () => {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setClasses(data);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Handler for create class
  const handleCreateClass = async () => {
    setIsLoading(true);
    setError("");
    if (!courseName || !courseCode || !room || !time || !maxStudents) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }
    // Insert into Supabase
    const { data, error } = await supabase
      .from("classes")
      .insert({
        name: courseName,
        code: courseCode,
        room,
        time,
        total_students: parseInt(maxStudents),
      })
      .select("*")
      .single();

    if (error) {
      setError(error.message || "Failed to create class");
    } else {
      // Success: reload classes, clear form
      fetchClasses();
      setCourseName("");
      setCourseCode("");
      setRoom("");
      setTime("");
      setMaxStudents("");
    }
    setIsLoading(false);
  };

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
                  <Input
                    id="course-name"
                    placeholder="e.g., Data Structures"
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    placeholder="e.g., CS201"
                    value={courseCode}
                    onChange={e => setCourseCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Input
                    id="room"
                    placeholder="e.g., A101"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    placeholder="e.g., 10:00 AM - 11:30 AM"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-students">Maximum Students</Label>
                  <Input
                    id="max-students"
                    type="number"
                    placeholder="e.g., 50"
                    value={maxStudents}
                    onChange={e => setMaxStudents(e.target.value)}
                  />
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <Button className="w-full btn-primary" onClick={handleCreateClass} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Schedule"}
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
                  {classes.length === 0 && (
                    <div className="text-muted-foreground">No classes scheduled yet.</div>
                  )}
                  {classes.map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{schedule.name}</h3>
                            <Badge variant="outline">{schedule.code}</Badge>
                          </div>
                          <div className="flex space-x-6 text-sm text-muted-foreground">
                            <span>{schedule.room}</span>
                            <span>{schedule.time}</span>
                            <span>{schedule.total_students} students</span>
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
                          Next session: {schedule.time}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassScheduling;
