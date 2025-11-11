import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const AdminReports = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("attendance");
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("is_active", true)
      .order("name");
    
    setClasses(data || []);
  };

  const generateAttendanceReport = async () => {
    setLoading(true);
    try {
      const { data: sessions, error } = await supabase
        .from("attendance_sessions")
        .select(`
          *,
          classes (*),
          attendance_records (
            *,
            students (*)
          )
        `)
        .eq("class_id", selectedClass)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reportData = sessions?.flatMap(session => 
        session.attendance_records.map((record: any) => ({
          'Session Code': session.session_code,
          'Date': new Date(session.start_time).toLocaleDateString(),
          'Course': session.classes.code,
          'Course Name': session.classes.name,
          'Student Name': record.students.name,
          'Matric Number': record.students.matric_number,
          'Department': record.students.department,
          'Check-in Time': new Date(record.checkin_time).toLocaleTimeString(),
          'Status': 'Present'
        }))
      );

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(reportData || []);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
      
      const filename = `Attendance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Report Generated",
        description: `Downloaded ${filename}`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSystemReport = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes, sessionsRes, recordsRes] = await Promise.all([
        supabase.from("students").select("*"),
        supabase.from("classes").select("*"),
        supabase.from("attendance_sessions").select("*"),
        supabase.from("attendance_records").select("*")
      ]);

      const reportData = [
        { Metric: 'Total Students', Value: studentsRes.data?.length || 0 },
        { Metric: 'Total Classes', Value: classesRes.data?.length || 0 },
        { Metric: 'Total Sessions', Value: sessionsRes.data?.length || 0 },
        { Metric: 'Total Attendance Records', Value: recordsRes.data?.length || 0 },
        { Metric: 'Average Attendance Rate', Value: `${Math.round((recordsRes.data?.length || 0) / (sessionsRes.data?.length || 1) * 100)}%` },
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(reportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'System Report');
      
      const filename = `System_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Report Generated",
        description: `Downloaded ${filename}`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Reports & Analytics</h1>
              <p className="text-muted-foreground">Generate and export system reports</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Attendance Report
              </CardTitle>
              <CardDescription>Generate detailed attendance records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.code} - {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                onClick={generateAttendanceReport}
                disabled={!selectedClass || loading}
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                System Report
              </CardTitle>
              <CardDescription>Export overall system analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a comprehensive report including total students, classes, sessions, and attendance statistics.
              </p>
              <Button 
                className="w-full" 
                onClick={generateSystemReport}
                disabled={loading}
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Report History</CardTitle>
            <CardDescription>Previously generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No previous reports. Generate your first report above.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
