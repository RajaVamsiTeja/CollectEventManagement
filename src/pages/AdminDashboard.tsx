import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { EventItem, Profile, Announcement, Sponsor, Club, Contact } from "@/types";
import {
  CalendarDays,
  Users,
  Ticket,
  TrendingUp,
  Plus,
  Trash2,
  Save,
  X,
  Loader2,
  Mail,
  Megaphone,
  Building2,
  Award,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { cn, formatDate, getSponsorTierColor } from "@/lib/utils";
import toast from "react-hot-toast";
import EmptyState from "@/components/EmptyState";

type Tab = "overview" | "events" | "users" | "announcements" | "sponsors" | "clubs" | "messages";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [regCount, setRegCount] = useState(0);

  const [annForm, setAnnForm] = useState({ title: "", content: "", is_pinned: false, is_ticker: false });
  const [sponsorForm, setSponsorForm] = useState({ name: "", logo_url: "", website_url: "", tier: "Bronze", description: "" });
  const [clubForm, setClubForm] = useState({ name: "", description: "", category: "", head_name: "", head_email: "", members_count: 0, meeting_schedule: "" });

  useEffect(() => {
    const fetchAll = async () => {
      const [ev, us, ann, sp, cl, ct, rc] = await Promise.all([
        supabase.from("events").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("sponsors").select("*").order("tier"),
        supabase.from("clubs").select("*").order("name"),
        supabase.from("contacts").select("*").order("created_at", { ascending: false }),
        supabase.from("registrations").select("id", { count: "exact", head: true }),
      ]);
      setEvents((ev.data as EventItem[]) || []);
      setUsers((us.data as Profile[]) || []);
      setAnnouncements((ann.data as Announcement[]) || []);
      setSponsors((sp.data as Sponsor[]) || []);
      setClubs((cl.data as Club[]) || []);
      setContacts((ct.data as Contact[]) || []);
      setRegCount(rc.count || 0);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const stats = [
    { icon: CalendarDays, label: "Total Events", value: events.length, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-900/20" },
    { icon: Users, label: "Total Users", value: users.length, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    { icon: Ticket, label: "Registrations", value: regCount, color: "text-accent-500", bg: "bg-accent-50 dark:bg-accent-900/20" },
    { icon: TrendingUp, label: "Upcoming", value: events.filter((e) => e.status === "Upcoming").length, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  const categoryData = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tabs: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "events", label: "Events", icon: CalendarDays },
    { id: "users", label: "Users", icon: Users },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "sponsors", label: "Sponsors", icon: Award },
    { id: "clubs", label: "Clubs", icon: Building2 },
    { id: "messages", label: "Messages", icon: Mail },
  ];

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); setEvents(events.filter((e) => e.id !== id)); }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) toast.error("Failed to update role");
    else { toast.success("Role updated"); setUsers(users.map((u) => u.id === userId ? { ...u, role: role as Profile["role"] } : u)); }
  };

  const handleAddAnnouncement = async () => {
    if (!annForm.title) { toast.error("Title required"); return; }
    const { data, error } = await supabase.from("announcements").insert(annForm).select("*").single();
    if (error) toast.error("Failed to add");
    else { toast.success("Announcement added"); setAnnouncements([data as Announcement, ...announcements]); setAnnForm({ title: "", content: "", is_pinned: false, is_ticker: false }); }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) toast.error("Failed");
    else { toast.success("Deleted"); setAnnouncements(announcements.filter((a) => a.id !== id)); }
  };

  const handleAddSponsor = async () => {
    if (!sponsorForm.name) { toast.error("Name required"); return; }
    const { data, error } = await supabase.from("sponsors").insert(sponsorForm).select("*").single();
    if (error) toast.error("Failed");
    else { toast.success("Sponsor added"); setSponsors([...sponsors, data as Sponsor]); setSponsorForm({ name: "", logo_url: "", website_url: "", tier: "Bronze", description: "" }); }
  };

  const handleDeleteSponsor = async (id: string) => {
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) toast.error("Failed");
    else { toast.success("Deleted"); setSponsors(sponsors.filter((s) => s.id !== id)); }
  };

  const handleAddClub = async () => {
    if (!clubForm.name) { toast.error("Name required"); return; }
    const { data, error } = await supabase.from("clubs").insert({ ...clubForm, social_links: {} }).select("*").single();
    if (error) toast.error("Failed");
    else { toast.success("Club added"); setClubs([...clubs, data as Club]); setClubForm({ name: "", description: "", category: "", head_name: "", head_email: "", members_count: 0, meeting_schedule: "" }); }
  };

  const handleDeleteClub = async (id: string) => {
    const { error } = await supabase.from("clubs").delete().eq("id", id);
    if (error) toast.error("Failed");
    else { toast.success("Deleted"); setClubs(clubs.filter((c) => c.id !== id)); }
  };

  const handleResolveContact = async (id: string) => {
    const { error } = await supabase.from("contacts").update({ is_resolved: true }).eq("id", id);
    if (error) toast.error("Failed");
    else { toast.success("Marked as resolved"); setContacts(contacts.map((c) => c.id === id ? { ...c, is_resolved: true } : c)); }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Full control over events, users and content</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2", s.bg)}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", tab === t.id ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">Events by Category</h3>
            <div className="space-y-3">
              {Object.entries(categoryData).map(([cat, count]) => {
                const pct = events.length > 0 ? (count / events.length) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">{cat}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-brand-500 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-4">Recent Events</h3>
            <div className="space-y-2">
              {events.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    {e.banner_image && <img src={e.banner_image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <span className="flex-1 truncate text-gray-700 dark:text-gray-200">{e.title}</span>
                  <span className="text-xs text-gray-400">{formatDate(e.event_date, "short")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                {e.banner_image && <img src={e.banner_image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{e.title}</h3>
                <p className="text-xs text-gray-500">{formatDate(e.event_date, "short")} · {e.category} · {e.status}</p>
              </div>
              <button onClick={() => handleDeleteEvent(e.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {events.length === 0 && <EmptyState title="No events" />}
        </div>
      )}

      {tab === "users" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">Dept</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.full_name || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={(e) => handleUpdateRole(u.id, e.target.value)} className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800">
                      <option value="student">Student</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.department || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "announcements" && (
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Add Announcement</h3>
            <input value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} className="input" placeholder="Title" />
            <textarea value={annForm.content} onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })} className="input min-h-[60px]" placeholder="Content" />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={annForm.is_pinned} onChange={(e) => setAnnForm({ ...annForm, is_pinned: e.target.checked })} className="rounded" /> Pinned</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={annForm.is_ticker} onChange={(e) => setAnnForm({ ...annForm, is_ticker: e.target.checked })} className="rounded" /> Ticker</label>
            </div>
            <button onClick={handleAddAnnouncement} className="btn btn-primary"><Plus className="w-4 h-4" /> Add</button>
          </div>
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="card p-4 flex items-center gap-3">
                <Megaphone className="w-5 h-5 text-accent-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-500 truncate">{a.content}</p>
                  <div className="flex gap-1 mt-1">
                    {a.is_pinned && <span className="badge bg-amber-100 text-amber-700 text-[10px]">Pinned</span>}
                    {a.is_ticker && <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-[10px]">Ticker</span>}
                  </div>
                </div>
                <button onClick={() => handleDeleteAnnouncement(a.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "sponsors" && (
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Add Sponsor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={sponsorForm.name} onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })} className="input" placeholder="Sponsor name" />
              <select value={sponsorForm.tier} onChange={(e) => setSponsorForm({ ...sponsorForm, tier: e.target.value })} className="input">
                <option>Gold</option><option>Silver</option><option>Bronze</option>
              </select>
              <input value={sponsorForm.logo_url} onChange={(e) => setSponsorForm({ ...sponsorForm, logo_url: e.target.value })} className="input" placeholder="Logo URL" />
              <input value={sponsorForm.website_url} onChange={(e) => setSponsorForm({ ...sponsorForm, website_url: e.target.value })} className="input" placeholder="Website URL" />
            </div>
            <input value={sponsorForm.description} onChange={(e) => setSponsorForm({ ...sponsorForm, description: e.target.value })} className="input" placeholder="Description" />
            <button onClick={handleAddSponsor} className="btn btn-primary"><Plus className="w-4 h-4" /> Add</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {sponsors.map((s) => (
              <div key={s.id} className={cn("card p-4 border-2 relative", getSponsorTierColor(s.tier))}>
                <button onClick={() => handleDeleteSponsor(s.id)} className="absolute top-2 right-2 p-1 rounded text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                <div className="h-12 flex items-center justify-center mb-2">
                  {s.logo_url && <img src={s.logo_url} alt="" className="max-h-full max-w-full object-contain rounded" />}
                </div>
                <p className="text-center text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{s.name}</p>
                <p className="text-center text-[10px] text-gray-400">{s.tier}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "clubs" && (
        <div className="space-y-4">
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Add Club</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={clubForm.name} onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })} className="input" placeholder="Club name" />
              <input value={clubForm.category} onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })} className="input" placeholder="Category" />
              <input value={clubForm.head_name} onChange={(e) => setClubForm({ ...clubForm, head_name: e.target.value })} className="input" placeholder="Head name" />
              <input value={clubForm.head_email} onChange={(e) => setClubForm({ ...clubForm, head_email: e.target.value })} className="input" placeholder="Head email" />
              <input value={clubForm.meeting_schedule} onChange={(e) => setClubForm({ ...clubForm, meeting_schedule: e.target.value })} className="input" placeholder="Meeting schedule" />
              <input type="number" value={clubForm.members_count} onChange={(e) => setClubForm({ ...clubForm, members_count: parseInt(e.target.value) || 0 })} className="input" placeholder="Members" />
            </div>
            <textarea value={clubForm.description} onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })} className="input min-h-[60px]" placeholder="Description" />
            <button onClick={handleAddClub} className="btn btn-primary"><Plus className="w-4 h-4" /> Add</button>
          </div>
          <div className="space-y-2">
            {clubs.map((c) => (
              <div key={c.id} className="card p-4 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-brand-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.category} · {c.members_count} members</p>
                </div>
                <button onClick={() => handleDeleteClub(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className="space-y-2">
          {contacts.length === 0 ? (
            <EmptyState icon={<Inbox className="w-8 h-8" />} title="No messages" description="Contact form submissions will appear here." />
          ) : contacts.map((c) => (
            <div key={c.id} className={cn("card p-4", c.is_resolved && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{c.name}</p>
                    {c.is_resolved && <span className="badge bg-green-100 text-green-700 text-[10px]">Resolved</span>}
                  </div>
                  <p className="text-xs text-gray-500">{c.email}</p>
                  {c.subject && <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mt-2">{c.subject}</p>}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{c.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{formatDate(c.created_at, "short")}</p>
                </div>
                {!c.is_resolved && (
                  <button onClick={() => handleResolveContact(c.id)} className="btn btn-secondary text-sm shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
