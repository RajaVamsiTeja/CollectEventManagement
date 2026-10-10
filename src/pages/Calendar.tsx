import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { EventItem } from "@/types";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { getCategoryColor, cn } from "@/lib/utils";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
      if (data) setEvents(data as EventItem[]);
    };
    fetchEvents();
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    events.forEach((e) => {
      const key = e.event_date;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayStr = new Date().toISOString().split("T")[0];
  const monthEvents = events.filter((e) => {
    const d = new Date(e.event_date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">Event Calendar</h1>
        <p className="text-gray-500 dark:text-gray-400">View all events in a calendar layout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Today
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square rounded-lg p-1.5 border transition-all",
                    isToday
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <span className={cn("text-xs font-medium", isToday ? "text-brand-600 dark:text-brand-400" : "text-gray-600 dark:text-gray-300")}>
                    {day}
                  </span>
                  {dayEvents.slice(0, 2).map((e) => (
                    <Link
                      key={e.id}
                      to={`/events/${e.slug}`}
                      className="block mt-1 text-[10px] px-1.5 py-0.5 rounded truncate hover:opacity-80 transition-opacity"
                    >
                      <span className={cn("badge px-1.5 py-0 text-[10px] w-full truncate block", getCategoryColor(e.category))}>
                        {e.title}
                      </span>
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] text-gray-400 mt-0.5 block">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events this month */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-500" /> This Month
          </h3>
          {monthEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events this month.</p>
          ) : (
            <div className="space-y-3">
              {monthEvents.map((e) => (
                <Link key={e.id} to={`/events/${e.slug}`} className="block group">
                  <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="w-12 text-center shrink-0">
                      <p className="text-xs text-gray-400">{MONTHS[new Date(e.event_date).getMonth()].slice(0, 3)}</p>
                      <p className="font-display font-bold text-lg text-gray-900 dark:text-white">{new Date(e.event_date).getDate()}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors line-clamp-1">{e.title}</p>
                      <p className="text-xs text-gray-500">{e.start_time} · {e.venue_name}</p>
                      <span className={cn("badge mt-1 text-[10px]", getCategoryColor(e.category))}>{e.category}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
