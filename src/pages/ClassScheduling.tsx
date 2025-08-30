import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  // Delete all attendance sessions in DB
  const handleDeleteAllSessions = async () => {
    await supabase.from("attendance_sessions").delete().neq("id", "");
    fetchClasses();
    alert("All sessions deleted from Supabase!");
  };

  // Handler for create class
  const handleCreateClass = async () => {
    setIsLoading(true);
    setError("");
    if (!courseName || !courseCode || !room || !time || !maxStudents) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }
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
      fetchClasses();
      setCourseName("");
      setCourseCode("");
      setRoom("");
      setTime("");
      setMaxStudents("");
    }
    setIsLoading(false);
  };

  // Start session for a class
  const handleStartSession = async (classId) => {
    // Create a unique session code
    const sessionCode = `ATD-${Date.now()}`;
    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert({
        class_id: classId,
        session_code: sessionCode,
        is_active: true,
        start_time: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (!error) {
      // Redirect to session page
      navigate(`/session/${data.id}`);
    } else {
      alert("Couldn't start session: " + error.message);
    }
  };

  // Delete a class
  const handleDeleteClass = async (id) => {
    await supabase.from("classes").delete().eq("id", id);
    fetchClasses();
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
          <Button variant="outline" onClick={handleDeleteAllSessions}>Delete All Sessions</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Create New Schedule Form */}
          <div className="lg:col-span-1">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Class
                </CardTitle>
                <CardDescription>Set up a new class schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-name">Course Name</Label>
                  <Input id="course-name" value={courseName} onChange={e => setCourseName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input id="course-code" value={courseCode} onChange={e => setCourseCode(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">Room</Label>
                  <Input id="room" value={room} onChange={e => setRoom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-students">Maximum Students</Label>
                  <Input id="max-students" type="number" value={maxStudents} onChange={e => setMaxStudents(e.target.value)} />
                </div>
                {error && <div className="text-red-500">{error}</div>}
                <Button className="w-full btn-primary" onClick={handleCreateClass} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Class"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Existing Classes */}
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Existing Classes</CardTitle>
                <CardDescription>Manage your current courses</CardDescription>
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
                          <Button variant="outline" size="sm" onClick={() => handleDeleteClass(schedule.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          Next session: {schedule.time}
                        </div>
                        <Button className="btn-success" size="sm" onClick={() => handleStartSession(schedule.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Session
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
