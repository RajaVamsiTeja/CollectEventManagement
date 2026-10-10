import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { EventItem, Registration } from "@/types";
import { slugify, generateTicketCode, formatDate, getEventStatusColor, getCategoryColor, cn } from "@/lib/utils";
import {
  Plus,
  CalendarDays,
  Users,
  Ticket,
  TrendingUp,
  Pencil,
  Trash2,
  X,
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "@/components/EmptyState";

const CATEGORIES = ["Technical", "Cultural", "Sports", "Workshop", "Seminar", "Hackathon", "Fest", "Club Activity"] as const;

type Tab = "overview" | "events" | "create";

interface EventForm {
  title: string;
  description: string;
  category: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_building: string;
  club_name: string;
  department: string;
  banner_image: string;
  max_participants: number;
  registration_deadline: string;
  registration_fee: number;
  is_featured: boolean;
  tags: string;
  contact_email: string;
  contact_phone: string;
  prizes: string;
  rules: string;
}

const emptyForm: EventForm = {
  title: "", description: "", category: "Technical", event_date: "", start_time: "", end_time: "",
  venue_name: "", venue_building: "", club_name: "", department: "", banner_image: "",
  max_participants: 0, registration_deadline: "", registration_fee: 0, is_featured: false,
  tags: "", contact_email: "", contact_phone: "", prizes: "", rules: "",
};

export default function OrganizerDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [participants, setParticipants] = useState<Registration[]>([]);

  const fetchEvents = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("events")
      .select("*")
      .or(`organizer_id.eq.${profile.id},created_by.eq.${profile.id}`)
      .order("created_at", { ascending: false });
    setEvents((data as EventItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [profile]);

  const fetchParticipants = async (eventId: string) => {
    const { data } = await supabase
      .from("registrations")
      .select("*, user:profiles(*)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    setParticipants((data as Registration[]) || []);
  };

  const handleSave = async () => {
    if (!profile || !form.title || !form.event_date) {
      toast.error("Title and date are required");
      return;
    }
    setSaving(true);
    const eventData = {
      title: form.title,
      slug: editingId ? undefined : slugify(form.title + "-" + Date.now().toString(36)),
      description: form.description,
      category: form.category,
      event_date: form.event_date,
      start_time: form.start_time,
      end_time: form.end_time,
      venue_name: form.venue_name,
      venue_building: form.venue_building,
      club_name: form.club_name,
      department: form.department,
      banner_image: form.banner_image,
      max_participants: form.max_participants,
      registration_deadline: form.registration_deadline || null,
      registration_fee: form.registration_fee,
      is_featured: form.is_featured,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      prizes: form.prizes,
      rules: form.rules,
      organizer_id: profile.id,
      created_by: editingId ? undefined : profile.id,
    };

    if (editingId) {
      const { error } = await supabase.from("events").update(eventData).eq("id", editingId);
      if (error) toast.error("Failed to update event");
      else { toast.success("Event updated!"); setEditingId(null); setForm(emptyForm); setTab("events"); fetchEvents(); }
    } else {
      const { error } = await supabase.from("events").insert(eventData);
      if (error) toast.error("Failed to create event");
      else { toast.success("Event created!"); setForm(emptyForm); setTab("events"); fetchEvents(); }
    }
    setSaving(false);
  };

  const handleEdit = (event: EventItem) => {
    setEditingId(event.id);
    setForm({
      title: event.title, description: event.description, category: event.category,
      event_date: event.event_date, start_time: event.start_time, end_time: event.end_time,
      venue_name: event.venue_name, venue_building: event.venue_building, club_name: event.club_name,
      department: event.department, banner_image: event.banner_image, max_participants: event.max_participants,
      registration_deadline: event.registration_deadline || "", registration_fee: event.registration_fee,
      is_featured: event.is_featured, tags: event.tags.join(", "), contact_email: event.contact_email,
      contact_phone: event.contact_phone, prizes: event.prizes, rules: event.rules,
    });
    setTab("create");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Event deleted"); fetchEvents(); }
  };

  const handleAttendance = async (regId: string, attended: boolean) => {
    const { error } = await supabase
      .from("registrations")
      .update({ attended, status: attended ? "attended" : "registered" })
      .eq("id", regId);
    if (error) toast.error("Failed to update");
    else {
      setParticipants((prev) => prev.map((p) => p.id === regId ? { ...p, attended, status: attended ? "attended" : "registered" } : p));
      toast.success(attended ? "Marked as attended" : "Attendance removed");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Status", "Attended", "Ticket Code", "Registered At"];
    const rows = participants.map((p) => [
      p.user?.full_name || "", p.user?.email || "", p.status, p.attended ? "Yes" : "No", p.ticket_code, formatDate(p.registered_at, "short"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `participants-${selectedEvent?.title}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { icon: CalendarDays, label: "My Events", value: events.length, color: "text-brand-500" },
    { icon: TrendingUp, label: "Upcoming", value: events.filter((e) => e.status === "Upcoming").length, color: "text-green-500" },
    { icon: Ticket, label: "Completed", value: events.filter((e) => e.status === "Completed").length, color: "text-gray-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">Organizer Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage your events</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm(emptyForm); setTab("create"); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <s.icon className={cn("w-6 h-6 mb-2", s.color)} />
            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800">
        {([["overview", "Overview"], ["events", "My Events"], ["create", editingId ? "Edit Event" : "Create Event"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("px-4 py-2.5 text-sm font-medium border-b-2 transition-colors", tab === id ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-4">
          {loading ? <p className="text-gray-500">Loading...</p> : events.length === 0 ? (
            <EmptyState title="No events yet" description="Create your first event to get started." action={<button onClick={() => setTab("create")} className="btn btn-primary"><Plus className="w-4 h-4" /> Create Event</button>} />
          ) : events.map((e) => (
            <div key={e.id} className="card p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                {e.banner_image && <img src={e.banner_image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{e.title}</h3>
                <p className="text-xs text-gray-500">{formatDate(e.event_date, "short")} · {e.venue_name}</p>
                <div className="flex gap-1 mt-1">
                  <span className={cn("badge text-[10px]", getCategoryColor(e.category))}>{e.category}</span>
                  <span className={cn("badge text-[10px]", getEventStatusColor(e.status))}>{e.status}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(e)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-brand-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => { setSelectedEvent(e); fetchParticipants(e.id); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-green-600"><Users className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "events" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e) => (
            <div key={e.id} className="card overflow-hidden">
              <div className="h-32 overflow-hidden">
                {e.banner_image && <img src={e.banner_image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{e.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatDate(e.event_date, "short")} · {e.start_time}</p>
                <div className="flex gap-1 mt-2">
                  <span className={cn("badge text-[10px]", getCategoryColor(e.category))}>{e.category}</span>
                  <span className={cn("badge text-[10px]", getEventStatusColor(e.status))}>{e.status}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to={`/events/${e.slug}`} className="btn btn-secondary flex-1 text-sm"><Eye className="w-4 h-4" /> View</Link>
                  <button onClick={() => handleEdit(e)} className="btn btn-secondary text-sm"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => { setSelectedEvent(e); fetchParticipants(e.id); }} className="btn btn-secondary text-sm"><Users className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(e.id)} className="btn btn-secondary text-sm text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "create" && (
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Event title" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[100px]" placeholder="Event description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Event Date *</label>
              <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Time</label>
              <input value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="input" placeholder="09:00 AM" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Time</label>
              <input value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="input" placeholder="05:00 PM" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Venue Name</label>
              <input value={form.venue_name} onChange={(e) => setForm({ ...form, venue_name: e.target.value })} className="input" placeholder="Main Auditorium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Building</label>
              <input value={form.venue_building} onChange={(e) => setForm({ ...form, venue_building: e.target.value })} className="input" placeholder="Academic Block" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Club Name</label>
              <input value={form.club_name} onChange={(e) => setForm({ ...form, club_name: e.target.value })} className="input" placeholder="Tech Club" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input" placeholder="Computer Science" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Banner Image URL</label>
              <input value={form.banner_image} onChange={(e) => setForm({ ...form, banner_image: e.target.value })} className="input" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Participants</label>
              <input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: parseInt(e.target.value) || 0 })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Fee (Rs)</label>
              <input type="number" value={form.registration_fee} onChange={(e) => setForm({ ...form, registration_fee: parseFloat(e.target.value) || 0 })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Registration Deadline</label>
              <input type="date" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="coding, innovation" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Email</label>
              <input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Phone</label>
              <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prizes</label>
              <input value={form.prizes} onChange={(e) => setForm({ ...form, prizes: e.target.value })} className="input" placeholder="1st: Rs 10,000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rules</label>
              <input value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} className="input" placeholder="Teams of 2-4" />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Event</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {editingId ? "Update" : "Create"} Event</>}
            </button>
            <button onClick={() => { setEditingId(null); setForm(emptyForm); setTab("events"); }} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="font-display font-semibold text-gray-900 dark:text-white">Participants</h3>
                <p className="text-sm text-gray-500">{selectedEvent.title}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportCSV} className="btn btn-secondary text-sm">Export CSV</button>
                <button onClick={() => setSelectedEvent(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="overflow-y-auto p-5">
              {participants.length === 0 ? (
                <EmptyState title="No registrations" description="No one has registered for this event yet." />
              ) : (
                <div className="space-y-2">
                  {participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                        {p.user?.full_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.user?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.user?.email} · {p.ticket_code}</p>
                      </div>
                      <span className={cn("badge text-[10px] capitalize", p.status === "registered" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : p.status === "waitlist" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600")}>{p.status}</span>
                      <button onClick={() => handleAttendance(p.id, !p.attended)} className={cn("p-2 rounded-lg", p.attended ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}>
                        {p.attended ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
