import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { EventItem, EventCategory } from "@/types";
import EventCard from "@/components/EventCard";
import { EventGridSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, LayoutGrid, List, CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES: (EventCategory | "All")[] = ["All", "Technical", "Cultural", "Sports", "Workshop", "Seminar", "Hackathon", "Fest", "Club Activity"];
const SORT_OPTIONS = [
  { value: "date-asc", label: "Date (Earliest)" },
  { value: "date-desc", label: "Date (Latest)" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "featured", label: "Featured First" },
];

export default function EventsList() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<EventCategory | "All">("All");
  const [status, setStatus] = useState<string>("Upcoming");
  const [sort, setSort] = useState("date-asc");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [feeFilter, setFeeFilter] = useState<string>("all");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (data) setEvents(data as EventItem[]);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    let result = [...events];

    if (category !== "All") {
      result = result.filter((e) => e.category === category);
    }
    if (status !== "All") {
      result = result.filter((e) => e.status === status);
    }
    if (feeFilter === "free") {
      result = result.filter((e) => e.registration_fee === 0);
    } else if (feeFilter === "paid") {
      result = result.filter((e) => e.registration_fee > 0);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          e.venue_name.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "date-asc":
        result.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
        break;
      case "date-desc":
        result.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
        break;
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "featured":
        result.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
        break;
    }

    return result;
  }, [events, category, status, search, sort, feeFilter]);

  const hasActiveFilters = category !== "All" || status !== "Upcoming" || feeFilter !== "all" || search !== "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">All Events</h1>
        <p className="text-gray-500 dark:text-gray-400">Browse and discover events happening on campus</p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, tags, venues..."
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={cn("btn btn-secondary", showFilters && "border-brand-500 text-brand-600")}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <div className="flex rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={cn("p-2.5 transition-colors", view === "grid" ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-2.5 transition-colors", view === "list" ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-4 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    category === cat
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                <option value="All">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fee</label>
              <select value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)} className="input">
                <option value="all">All Events</option>
                <option value="free">Free Only</option>
                <option value="paid">Paid Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setCategory("All"); setStatus("Upcoming"); setFeeFilter("all"); setSearch(""); }}
              className="text-sm text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
            >
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading..." : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Events Grid/List */}
      {loading ? (
        <EventGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="w-8 h-8" />}
          title="No events found"
          description="Try adjusting your filters or search terms."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}
