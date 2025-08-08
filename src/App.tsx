import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Registration from "./pages/Registration";
import LecturerDashboard from "./pages/LecturerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ClassScheduling from "./pages/ClassScheduling";
import AttendanceSession from "./pages/AttendanceSession";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/lecturer" element={<LecturerDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/schedule" element={<ClassScheduling />} />
          <Route path="/session/:id" element={<AttendanceSession />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
