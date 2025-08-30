import { Button } from "@/components/ui/button";
import { Navigation, AuthButtons } from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Clock, Shield, BarChart3 } from "lucide-react";
import heroImage from "@/assets/university-classroom.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/2e759af7-37bc-4e5f-9c0b-3aaed75ff12f.png" alt="Attendify Logo" className="h-10 w-auto" />
              <h1 className="text-xl font-bold text-primary">Attendify</h1>
            </div>
            <Navigation />
          </div>
          <AuthButtons />
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Attendify,{" "}
              <span className="text-primary">Smart Attendance.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your classroom with RFID-enabled student ID cards for seamless, 
              real-time attendance tracking that saves time and improves accuracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-3">
                Watch Demo
              </Button>
            </div>
            
            {/* RFID Technology Hint */}
            <div className="mt-12 flex items-center justify-center space-x-2 text-muted-foreground">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm">Simply tap your student ID card to check in</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Attendify?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Modern attendance tracking that works seamlessly with your existing infrastructure
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="card-elevated">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">RFID Technology</h3>
                <p className="text-sm text-muted-foreground">
                  Contactless check-in with existing student ID cards
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-elevated">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Real-Time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Instant attendance updates with live session monitoring
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-elevated">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with 99.9% uptime reliability
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-elevated">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive reports and attendance insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/lovable-uploads/2e759af7-37bc-4e5f-9c0b-3aaed75ff12f.png" alt="Attendify Logo" className="h-8 w-auto" />
            <h3 className="text-lg font-semibold text-primary">Attendify</h3>
          </div>
          <p className="text-muted-foreground">
            © 2024 Attendify. Making attendance management smarter.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;