import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ value, onChange, placeholder = "Select time", className }: TimePickerProps) {
  const [hours, setHours] = React.useState("09");
  const [minutes, setMinutes] = React.useState("00");
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM");

  React.useEffect(() => {
    if (value) {
      // Parse existing value (e.g., "09:00 AM" or "14:30")
      const timeMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1]);
        const m = timeMatch[2];
        const p = timeMatch[3]?.toUpperCase();

        if (p) {
          setPeriod(p as "AM" | "PM");
          setHours(h.toString().padStart(2, '0'));
        } else {
          // 24-hour format
          if (h >= 12) {
            setPeriod("PM");
            setHours((h > 12 ? h - 12 : h).toString().padStart(2, '0'));
          } else {
            setPeriod("AM");
            setHours((h === 0 ? 12 : h).toString().padStart(2, '0'));
          }
        }
        setMinutes(m);
      }
    }
  }, [value]);

  const handleApply = () => {
    const timeString = `${hours}:${minutes} ${period}`;
    onChange(timeString);
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 pointer-events-auto" align="start">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Hours</label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Minutes</label>
              <select
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
          <Button onClick={handleApply} className="w-full">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
