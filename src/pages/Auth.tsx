import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    rfidCode: "",
    studentId: "",
    matricNumber: "",
    department: "",
    level: "",
  });
  const [signInType, setSignInType] = useState<"email" | "rfid">("email");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let authData;
      
      if (signInType === "rfid") {
        // First, find user by RFID code
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .eq('rfid_code', formData.rfidCode)
          .single();

        if (profileError || !profileData) {
          throw new Error("RFID code not found. Please check your RFID code.");
        }

        // Get the user's email from auth.users via the user_id
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profileData.user_id);
        
        if (userError || !userData.user) {
          throw new Error("User account not found.");
        }

        authData = await supabase.auth.signInWithPassword({
          email: userData.user.email!,
          password: formData.password,
        });
      } else {
        authData = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      }

      if (authData.error) throw authData.error;

      if (authData.data.user) {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if RFID code already exists
    try {
      const { data: existingRfid } = await supabase
        .from('profiles')
        .select('rfid_code')
        .eq('rfid_code', formData.rfidCode)
        .single();

      if (existingRfid) {
        toast({
          title: "RFID Code Already Exists",
          description: "This RFID code is already registered. Please use a different one.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      // RFID code doesn't exist, which is good
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            rfid_code: formData.rfidCode,
            student_id: formData.studentId,
            matric_number: formData.matricNumber,
            department: formData.department,
            level: formData.level,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild className="mr-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Attendify</h1>
            <p className="text-muted-foreground text-sm">Smart Attendance Management</p>
          </div>
        </div>

        <Card className="card-elevated">
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sign In Method</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={signInType === "email" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSignInType("email")}
                        className="flex-1"
                      >
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={signInType === "rfid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSignInType("rfid")}
                        className="flex-1"
                      >
                        RFID
                      </Button>
                    </div>
                  </div>

                  {signInType === "email" ? (
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="signin-rfid">RFID Code</Label>
                      <Input
                        id="signin-rfid"
                        name="rfidCode"
                        type="text"
                        placeholder="Enter your RFID code"
                        value={formData.rfidCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input
                      id="signup-fullname"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-rfid">RFID Code</Label>
                    <Input
                      id="signup-rfid"
                      name="rfidCode"
                      type="text"
                      placeholder="Enter your RFID code"
                      value={formData.rfidCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-studentid">Student ID</Label>
                    <Input
                      id="signup-studentid"
                      name="studentId"
                      type="text"
                      placeholder="Enter your student ID"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-matric">Matric Number</Label>
                    <Input
                      id="signup-matric"
                      name="matricNumber"
                      type="text"
                      placeholder="Enter your matric number"
                      value={formData.matricNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-department">Department</Label>
                    <Select onValueChange={(value) => handleSelectChange("department", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="Business Administration">Business Administration</SelectItem>
                        <SelectItem value="Accounting">Accounting</SelectItem>
                        <SelectItem value="Economics">Economics</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-level">Level</Label>
                    <Select onValueChange={(value) => handleSelectChange("level", value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 Level</SelectItem>
                        <SelectItem value="200">200 Level</SelectItem>
                        <SelectItem value="300">300 Level</SelectItem>
                        <SelectItem value="400">400 Level</SelectItem>
                        <SelectItem value="500">500 Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>RFID cards will be used for attendance scanning.</p>
          <p>Contact admin for access permissions.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;