import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Registration, Bookmark, EventItem } from "@/types";
import { QRCodeSVG } from "qrcode.react";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";
import {
  CalendarDays,
  Ticket,
  Bookmark as BookmarkIcon,
  TrendingUp,
  Download,
  X,
} from "lucide-react";
import { formatDate, getEventStatusColor, cn } from "@/lib/utils";

type Tab = "overview" | "registrations" | "tickets" | "bookmarks";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketModal, setTicketModal] = useState<Registration | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      const [regRes, bmRes] = await Promise.all([
        supabase
          .from("registrations")
          .select("*, event:events(*)")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookmarks")
          .select("*, event:events(*)")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false }),
      ]);
      setRegistrations((regRes.data as Registration[]) || []);
      setBookmarks((bmRes.data as Bookmark[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const activeRegistrations = registrations.filter((r) => r.status === "registered" || r.status === "attended");
  const upcomingRegistrations = activeRegistrations.filter((r) => r.event?.status === "Upcoming");
  const pastRegistrations = activeRegistrations.filter((r) => r.event?.status === "Completed");

  const stats = [
    { icon: CalendarDays, label: "Total Registered", value: registrations.length, color: "text-brand-500" },
    { icon: TrendingUp, label: "Upcoming", value: upcomingRegistrations.length, color: "text-green-500" },
    { icon: Ticket, label: "Active Tickets", value: activeRegistrations.length, color: "text-accent-500" },
    { icon: BookmarkIcon, label: "Bookmarked", value: bookmarks.length, color: "text-purple-500" },
  ];

  const tabs: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
    { id: "overview", label: "Overview", icon: CalendarDays },
    { id: "registrations", label: "My Registrations", icon: Ticket },
    { id: "tickets", label: "My Tickets", icon: Ticket },
    { id: "bookmarks", label: "Bookmarks", icon: BookmarkIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">
          Welcome, {profile?.full_name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your events, tickets and bookmarks</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <s.icon className={cn("w-6 h-6 mb-2", s.color)} />
            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              tab === t.id
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
                {upcomingRegistrations.length === 0 ? (
                  <EmptyState title="No upcoming events" description="Browse events and register to see them here." action={<Link to="/events" className="btn btn-primary">Browse Events</Link>} />
                ) : (
                  <div className="space-y-3">
                    {upcomingRegistrations.map((reg) => (
                      <Link key={reg.id} to={`/events/${reg.event?.slug}`} className="block">
                        <div className="card p-4 flex items-center gap-4 group">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                            {reg.event?.banner_image && <img src={reg.event.banner_image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors truncate">{reg.event?.title}</h3>
                            <p className="text-xs text-gray-500">{formatDate(reg.event?.event_date || "", "short")} · {reg.event?.start_time}</p>
                          </div>
                          <span className={cn("badge", getEventStatusColor(reg.event?.status || ""))}>{reg.event?.status}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">Past Events</h2>
                {pastRegistrations.length === 0 ? (
                  <p className="text-sm text-gray-500">No past events attended yet.</p>
                ) : (
                  <div className="space-y-3">
                    {pastRegistrations.map((reg) => (
                      <Link key={reg.id} to={`/events/${reg.event?.slug}`} className="block">
                        <div className="card p-4 flex items-center gap-4 group opacity-75">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                            {reg.event?.banner_image && <img src={reg.event.banner_image} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">{reg.event?.title}</h3>
                            <p className="text-xs text-gray-500">{formatDate(reg.event?.event_date || "", "short")}</p>
                          </div>
                          {reg.attended && <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Attended</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "registrations" && (
            registrations.length === 0 ? (
              <EmptyState title="No registrations yet" description="Register for events to see them here." action={<Link to="/events" className="btn btn-primary">Browse Events</Link>} />
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <Link key={reg.id} to={`/events/${reg.event?.slug}`}>
                    <div className="card p-4 flex items-center gap-4 group">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        {reg.event?.banner_image && <img src={reg.event.banner_image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors truncate">{reg.event?.title}</h3>
                        <p className="text-xs text-gray-500">{formatDate(reg.event?.event_date || "", "short")}</p>
                      </div>
                      <span className={cn(
                        "badge capitalize",
                        reg.status === "registered" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                        reg.status === "waitlist" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                        reg.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      )}>{reg.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {tab === "tickets" && (
            activeRegistrations.length === 0 ? (
              <EmptyState icon={<Ticket className="w-8 h-8" />} title="No tickets" description="Your event tickets will appear here after registration." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRegistrations.map((reg) => (
                  <div key={reg.id} className="card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        {reg.event?.banner_image && <img src={reg.event.banner_image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{reg.event?.title}</h3>
                        <p className="text-xs text-gray-500">{formatDate(reg.event?.event_date || "", "short")}</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl flex justify-center mb-3">
                      <QRCodeSVG value={reg.ticket_code} size={120} />
                    </div>
                    <p className="text-center text-xs text-gray-500 mb-1">Ticket Code</p>
                    <p className="text-center font-mono font-bold text-sm text-gray-900 dark:text-white mb-3">{reg.ticket_code}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setTicketModal(reg)} className="btn btn-secondary flex-1 text-sm">
                        <Download className="w-4 h-4" /> View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "bookmarks" && (
            bookmarks.length === 0 ? (
              <EmptyState icon={<BookmarkIcon className="w-8 h-8" />} title="No bookmarks" description="Bookmark events to save them for later." action={<Link to="/events" className="btn btn-primary">Browse Events</Link>} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bm) => (
                  <EventCard key={bm.id} event={bm.event as EventItem} />
                ))}
              </div>
            )
          )}
        </>
      )}

      {ticketModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setTicketModal(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">Event Ticket</h3>
              <button onClick={() => setTicketModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="text-center">
              <div className="bg-white p-3 rounded-xl inline-block mb-3">
                <QRCodeSVG value={ticketModal.ticket_code} size={160} />
              </div>
              <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">{ticketModal.ticket_code}</p>
              <p className="text-sm text-gray-500 mt-2">{ticketModal.event?.title}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(ticketModal.event?.event_date || "", "full")} · {ticketModal.event?.venue_name}</p>
              <button onClick={() => window.print()} className="btn btn-primary w-full mt-4">
                <Download className="w-4 h-4" /> Print Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
