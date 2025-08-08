import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={cn("flex items-center space-x-8", className)}>
      <Link
        to="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/") ? "text-primary" : "text-muted-foreground"
        )}
      >
        Home
      </Link>
      <Link
        to="/about"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/about") ? "text-primary" : "text-muted-foreground"
        )}
      >
        About
      </Link>
      <Link
        to="/contact"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive("/contact") ? "text-primary" : "text-muted-foreground"
        )}
      >
        Contact
      </Link>
    </nav>
  );
}

interface AuthButtonsProps {
  className?: string;
}

export function AuthButtons({ className }: AuthButtonsProps) {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <Button variant="outline" asChild className="btn-secondary">
        <Link to="/register">Register</Link>
      </Button>
      <Button asChild className="btn-primary">
        <Link to="/lecturer">Login</Link>
      </Button>
    </div>
  );
}