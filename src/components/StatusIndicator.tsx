import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

interface StatusIndicatorProps {
  connected: boolean;
  label: string;
  className?: string;
}

export function StatusIndicator({ connected, label, className }: StatusIndicatorProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {connected ? (
        <div className="flex items-center space-x-2 text-success">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">{label} Connected</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-destructive">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">{label} Disconnected</span>
        </div>
      )}
    </div>
  );
}