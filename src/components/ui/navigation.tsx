import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  return (
    <nav className="flex items-center space-x-6">
      <Link to="#features" className="text-sm font-medium hover:text-primary">
        Features
      </Link>
      <Link to="#about" className="text-sm font-medium hover:text-primary">
        About
      </Link>
      <Link to="#contact" className="text-sm font-medium hover:text-primary">
        Contact
      </Link>
    </nav>
  );
};

export const AuthButtons = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex space-x-2">
        <div className="w-16 h-9 bg-muted animate-pulse rounded"></div>
        <div className="w-16 h-9 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/lecturer")}>
              Lecturer Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/student")}>
              Student Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              Admin Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <Button variant="ghost" asChild>
        <Link to="/auth">Sign In</Link>
      </Button>
      <Button asChild>
        <Link to="/auth">Get Started</Link>
      </Button>
    </div>
  );
};