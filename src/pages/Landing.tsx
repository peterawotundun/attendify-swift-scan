import { Button } from "@/components/ui/button";
import { Navigation, AuthButtons } from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Clock, Shield, BarChart3, GraduationCap, BookOpen, UserCog } from "lucide-react";
import heroImage from "@/assets/university-classroom.jpg";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center" style={{ gap: '3px' }}>
              <img src="/lovable-uploads/2e759af7-37bc-4e5f-9c0b-3aaed75ff12f.png" alt="Attendify Logo" className="h-12 w-auto" />
              <h1 className="text-xl font-bold text-primary">Attendify</h1>
            </div>
            <Navigation />
          </div>
          <AuthButtons />
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now Live - Next Generation Attendance System
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight">
              Smart Attendance,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your classroom with enterprise-grade RFID technology. 
              Real-time tracking, powerful analytics, and seamless integration.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Button 
                size="lg" 
                className="btn-primary text-lg px-8 py-6 flex items-center justify-center gap-2 group"
                onClick={() => navigate('/auth?role=student')}
              >
                <GraduationCap className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Student Login
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary text-lg px-8 py-6 flex items-center justify-center gap-2 group"
                onClick={() => navigate('/auth?role=lecturer')}
              >
                <BookOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Lecturer Login
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-secondary text-lg px-8 py-6 flex items-center justify-center gap-2 group"
                onClick={() => navigate('/auth?role=admin')}
              >
                <UserCog className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Admin Login
              </Button>
            </div>
            
            {/* RFID Technology Hint */}
            <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-card border border-border rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Contactless Check-in</p>
                <p className="text-xs text-muted-foreground">Simply tap your student ID card</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Attendify?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade features designed for modern educational institutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-interactive group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">RFID Technology</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Contactless check-in with existing student ID cards for instant attendance marking
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-interactive group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-success/10 to-success/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Real-Time Tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Live attendance updates with instant notifications and session monitoring
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-interactive group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enterprise-grade security with 99.9% uptime and data encryption
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-interactive group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Comprehensive reports, insights, and exportable attendance data
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center mb-6" style={{ gap: '6px' }}>
              <img src="/lovable-uploads/2e759af7-37bc-4e5f-9c0b-3aaed75ff12f.png" alt="Attendify Logo" className="h-12 w-auto" />
              <h3 className="text-2xl font-bold text-primary">Attendify</h3>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              Next-generation attendance management system designed for modern educational institutions.
            </p>
            <div className="flex items-center justify-center gap-6 pt-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support</a>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              © 2024 Attendify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;