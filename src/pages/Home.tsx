import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { EventItem, Announcement, Sponsor } from "@/types";
import EventCard from "@/components/EventCard";
import CountdownTimer from "@/components/CountdownTimer";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import { EventGridSkeleton } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import {
  ArrowRight,
  CalendarDays,
  Images,
  Video,
  TrendingUp,
  Award,
  Sparkles,
  Pin,
} from "lucide-react";
import { formatDate, getSponsorTierColor } from "@/lib/utils";

export default function Home() {
  const [featured, setFeatured] = useState<EventItem[]>([]);
  const [upcoming, setUpcoming] = useState<EventItem[]>([]);
  const [pinnedAnnouncements, setPinnedAnnouncements] = useState<Announcement[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [featuredRes, upcomingRes, annRes, sponsorRes] = await Promise.all([
        supabase
          .from("events")
          .select("*")
          .eq("is_featured", true)
          .eq("status", "Upcoming")
          .order("event_date", { ascending: true })
          .limit(5),
        supabase
          .from("events")
          .select("*")
          .eq("status", "Upcoming")
          .order("event_date", { ascending: true })
          .limit(6),
        supabase
          .from("announcements")
          .select("*")
          .eq("is_pinned", true)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase.from("sponsors").select("*").order("tier", { ascending: true }),
      ]);

      setFeatured((featuredRes.data as EventItem[]) || []);
      setUpcoming((upcomingRes.data as EventItem[]) || []);
      setPinnedAnnouncements((annRes.data as Announcement[]) || []);
      setSponsors((sponsorRes.data as Sponsor[]) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % featured.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featured.length]);

  const nextEvent = upcoming[0];

  return (
    <div>
      <AnnouncementTicker />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 text-white">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> Welcome to CampusEvents
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">
              Discover &amp; Join <br className="hidden sm:block" />
              <span className="text-accent-300">College Events</span> That Matter
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Hackathons, cultural fests, workshops, seminars and more. Browse upcoming events, register with one click, and never miss out on campus life.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/events" className="btn btn-accent">
                <CalendarDays className="w-4 h-4" /> Explore Events
              </Link>
              <Link to="/gallery" className="btn bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20">
                <Images className="w-4 h-4" /> View Gallery
              </Link>
            </div>
          </motion.div>

          {/* Countdown to next event */}
          {nextEvent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 inline-flex flex-col gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20"
            >
              <div className="flex items-center gap-2 text-sm text-white/80">
                <TrendingUp className="w-4 h-4" /> Next Event In
              </div>
              <Link to={`/events/${nextEvent.slug}`}>
                <p className="font-display font-semibold text-lg mb-3 hover:text-accent-300 transition-colors">
                  {nextEvent.title}
                </p>
              </Link>
              <CountdownTimer targetDate={nextEvent.event_date} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Event Carousel */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-accent-500" /> Featured Events
            </h2>
            <div className="flex gap-2">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === carouselIndex ? "w-6 bg-brand-500" : "w-2 bg-gray-300 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <motion.div
              key={featured[carouselIndex]?.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {featured[carouselIndex] && (
                <Link to={`/events/${featured[carouselIndex].slug}`}>
                  <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden group">
                    <img
                      src={featured[carouselIndex].banner_image}
                      alt={featured[carouselIndex].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                      <span className="badge bg-accent-500 text-white mb-2">Featured</span>
                      <h3 className="font-display font-bold text-2xl sm:text-3xl mb-2">{featured[carouselIndex].title}</h3>
                      <p className="text-white/80 line-clamp-2 mb-3 max-w-2xl">{featured[carouselIndex].description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-white/90">
                        <span>{formatDate(featured[carouselIndex].event_date, "full")}</span>
                        <span>{featured[carouselIndex].venue_name}</span>
                        <span className="badge bg-white/20 backdrop-blur-sm">{featured[carouselIndex].category}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pinnedAnnouncements.map((ann, i) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-5 border-l-4 border-l-accent-500"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Pin className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{ann.title}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{ann.content}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-500" /> Upcoming Events
          </h2>
          <Link to="/events" className="text-sm font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <EventGridSkeleton count={6} />
        ) : upcoming.length === 0 ? (
          <EmptyState title="No upcoming events" description="Check back soon for new events!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/gallery" className="group">
            <div className="card p-6 flex items-center gap-4 hover:border-brand-300 dark:hover:border-brand-700">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Images className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gray-900 dark:text-white">Photo Gallery</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Relive past events through photos</p>
              </div>
            </div>
          </Link>
          <Link to="/videos" className="group">
            <div className="card p-6 flex items-center gap-4 hover:border-accent-300 dark:hover:border-accent-700">
              <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gray-900 dark:text-white">Videos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Watch event highlights &amp; reels</p>
              </div>
            </div>
          </Link>
          <Link to="/calendar" className="group">
            <div className="card p-6 flex items-center gap-4 hover:border-green-300 dark:hover:border-green-700">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-gray-900 dark:text-white">Calendar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">View events in calendar format</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white text-center mb-8">
            Our Sponsors
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {sponsors.map((sponsor, i) => (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`card p-4 border-2 ${getSponsorTierColor(sponsor.tier)}`}
              >
                <div className="h-16 flex items-center justify-center mb-2">
                  {sponsor.logo_url && (
                    <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain rounded" />
                  )}
                </div>
                <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-200">{sponsor.name}</p>
                <p className="text-center text-xs text-gray-400 mt-0.5">{sponsor.tier} Sponsor</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
