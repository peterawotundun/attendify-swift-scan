import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Registration = () => {
  const [selectedTab, setSelectedTab] = useState("student");

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="card-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join Attendify</CardTitle>
            <CardDescription>
              Create your account to get started with smart attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="lecturer">Lecturer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="student" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Full Name</Label>
                    <Input id="student-name" placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input id="student-email" type="email" placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input id="student-id" placeholder="Enter your student ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input id="student-password" type="password" placeholder="Create a password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-confirm">Confirm Password</Label>
                    <Input id="student-confirm" type="password" placeholder="Confirm your password" />
                  </div>
                </div>
                <Button className="w-full btn-primary">Register as Student</Button>
              </TabsContent>
              
              <TabsContent value="lecturer" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lecturer-name">Full Name</Label>
                    <Input id="lecturer-name" placeholder="Enter your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturer-email">Email</Label>
                    <Input id="lecturer-email" type="email" placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturer-department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturer-employee-id">Employee ID</Label>
                    <Input id="lecturer-employee-id" placeholder="Enter your employee ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturer-password">Password</Label>
                    <Input id="lecturer-password" type="password" placeholder="Create a password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lecturer-confirm">Confirm Password</Label>
                    <Input id="lecturer-confirm" type="password" placeholder="Confirm your password" />
                  </div>
                </div>
                <Button className="w-full btn-primary">Register as Lecturer</Button>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/lecturer" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Registration;