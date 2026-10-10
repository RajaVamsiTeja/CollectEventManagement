import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Announcement } from "@/types";

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchTicker = async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_ticker", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setAnnouncements(data as Announcement[]);
    };
    fetchTicker();
  }, []);

  if (announcements.length === 0) return null;

  const items = [...announcements, ...announcements];

  return (
    <div className="bg-gradient-to-r from-brand-600 to-accent-500 text-white py-2.5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0 font-semibold text-sm">
          <Megaphone className="w-4 h-4" />
          <span className="hidden sm:inline">Announcements</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-8 animate-ticker whitespace-nowrap text-sm">
            {items.map((a, i) => (
              <span key={`${a.id}-${i}`} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                {a.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
