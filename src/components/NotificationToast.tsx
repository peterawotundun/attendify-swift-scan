import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

interface NotificationToastProps {
  studentId: string | null;
}

export const NotificationToast = ({ studentId }: NotificationToastProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!studentId) return;

    // Listen for new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `student_id=eq.${studentId}`
        },
        (payload) => {
          const notification = payload.new;
          
          toast({
            title: notification.notification_type === 'attendance' 
              ? "Attendance Marked!" 
              : notification.notification_type === 'cancellation'
              ? "Class Cancelled"
              : "Notification",
            description: notification.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId, toast]);

  return null;
};
