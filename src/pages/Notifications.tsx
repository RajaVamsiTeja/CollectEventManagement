import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Notification } from "@/types";
import { Bell, CheckCheck, Trash2, Inbox } from "lucide-react";
import { relativeTime, cn } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";

export default function Notifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [profile]);

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", profile.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-brand-500" /> Notifications
          </h1>
          {unreadCount > 0 && <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>}
        </div>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary text-sm">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Inbox className="w-8 h-8" />} title="No notifications" description="You'll see event updates and reminders here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className={cn("card p-4 flex items-start gap-3", !n.is_read && "border-l-4 border-l-brand-500")}>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", !n.is_read ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400")}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{n.title}</p>
                {n.message && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>}
                <p className="text-xs text-gray-400 mt-1">{relativeTime(n.created_at)}</p>
              </div>
              {n.link && <Link to={n.link} className="text-xs text-brand-600 dark:text-brand-400 hover:underline shrink-0">View</Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
