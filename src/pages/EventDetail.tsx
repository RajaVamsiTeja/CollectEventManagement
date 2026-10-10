import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { EventItem, Registration, Feedback, Comment as CommentType } from "@/types";
import CountdownTimer from "@/components/CountdownTimer";
import StarRating from "@/components/StarRating";
import EmptyState from "@/components/EmptyState";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  Mail,
  Phone,
  Share2,
  Bookmark,
  CalendarPlus,
  MessageCircle,
  Send,
  Download,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Award,
  ListChecks,
  UserCircle,
} from "lucide-react";
import {
  formatDate,
  getCategoryColor,
  getEventStatusColor,
  cn,
  slugify,
} from "@/lib/utils";
import toast from "react-hot-toast";

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [regCount, setRegCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newFeedback, setNewFeedback] = useState("");
  const [showTicket, setShowTicket] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (data) {
        setEvent(data as EventItem);

        const [regRes, countRes, fbRes, cmRes, relatedRes] = await Promise.all([
          session?.user
            ? supabase
                .from("registrations")
                .select("*")
                .eq("event_id", (data as EventItem).id)
                .eq("user_id", session.user.id)
                .maybeSingle()
            : Promise.resolve({ data: null }),
          supabase
            .from("registrations")
            .select("id", { count: "exact", head: true })
            .eq("event_id", (data as EventItem).id)
            .in("status", ["registered", "attended"]),
          supabase
            .from("feedback")
            .select("*, user:profiles(*)")
            .eq("event_id", (data as EventItem).id)
            .order("created_at", { ascending: false }),
          supabase
            .from("comments")
            .select("*, user:profiles(*)")
            .eq("event_id", (data as EventItem).id)
            .is("parent_id", null)
            .order("created_at", { ascending: false }),
          supabase
            .from("events")
            .select("*")
            .eq("category", (data as EventItem).category)
            .neq("id", (data as EventItem).id)
            .limit(3),
        ]);

        setRegistration((regRes.data as Registration) || null);
        setRegCount(countRes.count || 0);
        setFeedback((fbRes.data as Feedback[]) || []);
        setComments((cmRes.data as CommentType[]) || []);
        setRelatedEvents((relatedRes.data as EventItem[]) || []);

        if (session?.user) {
          const { data: bm } = await supabase
            .from("bookmarks")
            .select("id")
            .eq("user_id", session.user.id)
            .eq("event_id", (data as EventItem).id)
            .maybeSingle();
          setIsBookmarked(!!bm);
        }
      }
      setLoading(false);
    };
    if (slug) fetchEvent();
  }, [slug, session?.user?.id]);

  const handleRegister = async () => {
    if (!session) {
      toast.error("Please sign in to register");
      navigate("/login");
      return;
    }
    if (!event) return;

    const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
    if (deadline && deadline < new Date()) {
      toast.error("Registration deadline has passed");
      return;
    }
    if (event.status === "Cancelled") {
      toast.error("This event has been cancelled");
      return;
    }

    setRegistering(true);
    const isWaitlist = event.max_participants > 0 && regCount >= event.max_participants;
    const ticketCode = `EVT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const { data, error } = await supabase
      .from("registrations")
      .insert({
        event_id: event.id,
        user_id: session.user.id,
        status: isWaitlist ? "waitlist" : "registered",
        ticket_code: ticketCode,
      })
      .select("*")
      .single();

    setRegistering(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("You are already registered for this event");
      } else {
        toast.error("Failed to register. Please try again.");
      }
    } else {
      setRegistration(data as Registration);
      setRegCount((c) => c + 1);
      if (isWaitlist) {
        toast.success("Added to waitlist! You'll be notified if a spot opens up.");
      } else {
        toast.success("Registration successful! Your ticket is ready.");
        setShowTicket(true);
      }
    }
  };

  const handleCancelRegistration = async () => {
    if (!registration || !event) return;
    const { error } = await supabase
      .from("registrations")
      .update({ status: "cancelled" })
      .eq("id", registration.id);
    if (error) {
      toast.error("Failed to cancel registration");
    } else {
      setRegistration({ ...registration, status: "cancelled" });
      setRegCount((c) => Math.max(0, c - 1));
      toast.success("Registration cancelled");
    }
  };

  const handleBookmark = async () => {
    if (!session || !event) {
      toast.error("Please sign in to bookmark events");
      return;
    }
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", session.user.id).eq("event_id", event.id);
      setIsBookmarked(false);
      toast.success("Removed from bookmarks");
    } else {
      await supabase.from("bookmarks").insert({ user_id: session.user.id, event_id: event.id });
      setIsBookmarked(true);
      toast.success("Added to bookmarks");
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=Check out this event: ${event?.title} ${url}`);
    } else if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    const start = new Date(event.event_date).toISOString().replace(/[-:]/g, "").split(".")[0];
    const end = new Date(event.event_date).toISOString().replace(/[-:]/g, "").split(".")[0];
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue_name)}`;
    window.open(calendarUrl);
  };

  const handleSubmitFeedback = async () => {
    if (!session || !event) return;
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        event_id: event.id,
        user_id: session.user.id,
        rating: newRating,
        comment: newFeedback,
      })
      .select("*, user:profiles(*)")
      .single();
    if (error) {
      if (error.code === "23505") {
        toast.error("You have already given feedback for this event");
      } else {
        toast.error("Failed to submit feedback");
      }
    } else {
      setFeedback([data as Feedback, ...feedback]);
      setNewFeedback("");
      setNewRating(5);
      toast.success("Feedback submitted!");
    }
  };

  const handleSubmitComment = async () => {
    if (!session || !event || !newComment.trim()) return;
    const { data, error } = await supabase
      .from("comments")
      .insert({
        event_id: event.id,
        user_id: session.user.id,
        content: newComment,
      })
      .select("*, user:profiles(*)")
      .single();
    if (error) {
      toast.error("Failed to post comment");
    } else {
      setComments([data as CommentType, ...comments]);
      setNewComment("");
      toast.success("Comment posted!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <EmptyState
        title="Event not found"
        description="The event you're looking for doesn't exist or has been removed."
        action={<Link to="/events" className="btn btn-primary">Browse Events</Link>}
      />
    );
  }

  const seatsLeft = event.max_participants > 0 ? event.max_participants - regCount : null;
  const isRegistered = registration && registration.status !== "cancelled";
  const avgRating = feedback.length > 0 ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {event.banner_image && (
          <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <Link to="/events" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={cn("badge", getCategoryColor(event.category))}>{event.category}</span>
              <span className={cn("badge bg-white/20 backdrop-blur-md text-white", getEventStatusColor(event.status))}>{event.status}</span>
              {event.is_featured && <span className="badge bg-accent-500 text-white">Featured</span>}
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/90">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(event.event_date, "full")}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {event.start_time} - {event.end_time}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.venue_name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-3">About This Event</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.tags.map((tag) => (
                    <span key={tag} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      <Tag className="w-3 h-3 mr-1" /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">Speakers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((sp, i) => (
                    <div key={i} className="card p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        {sp.photo && <img src={sp.photo} alt={sp.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{sp.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{sp.designation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-brand-500" /> Schedule
                </h2>
                <div className="space-y-3">
                  {event.schedule.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-50 dark:ring-brand-900/30" />
                        {i < event.schedule.length - 1 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 flex-1 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <span className="text-sm font-medium text-brand-600 dark:text-brand-400">{item.time}</span>
                        <p className="text-gray-700 dark:text-gray-200 text-sm mt-0.5">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Prizes & Rules */}
            {(event.prizes || event.rules) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.prizes && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-amber-500" /> Prizes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{event.prizes}</p>
                  </div>
                )}
                {event.rules && (
                  <div className="card p-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rules</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{event.rules}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Venue Map */}
            {event.venue_map_link && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">Venue</h2>
                <div className="card overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <p className="font-medium text-gray-900 dark:text-white">{event.venue_name}</p>
                    {event.venue_building && <p className="text-sm text-gray-500 dark:text-gray-400">{event.venue_building}</p>}
                  </div>
                  <a href={event.venue_map_link} target="_blank" rel="noreferrer" className="block">
                    <div className="h-56 bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/30 dark:to-accent-900/30 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-10 h-10 text-brand-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">View on Google Maps</p>
                      </div>
                    </div>
                  </a>
                </div>
              </motion.div>
            )}

            {/* Feedback */}
            {event.status === "Completed" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">
                  Feedback &amp; Reviews
                  {feedback.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      {avgRating.toFixed(1)} avg ({feedback.length} reviews)
                    </span>
                  )}
                </h2>
                {session ? (
                  <div className="card p-5 mb-4">
                    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">Share your experience</h3>
                    <StarRating value={newRating} onChange={setNewRating} />
                    <textarea
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      placeholder="Write your feedback..."
                      className="input mt-3 min-h-[80px]"
                    />
                    <button onClick={handleSubmitFeedback} className="btn btn-primary mt-3">
                      <Send className="w-4 h-4" /> Submit Feedback
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">Sign in to share your feedback.</p>
                )}
                <div className="space-y-3">
                  {feedback.map((f) => (
                    <div key={f.id} className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white text-xs font-semibold flex items-center justify-center">
                            {f.user?.full_name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{f.user?.full_name || "Anonymous"}</span>
                        </div>
                        <StarRating value={f.rating} readonly size={14} />
                      </div>
                      {f.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{f.comment}</p>}
                    </div>
                  ))}
                  {feedback.length === 0 && <p className="text-sm text-gray-500">No feedback yet.</p>}
                </div>
              </motion.div>
            )}

            {/* Comments */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-500" /> Discussion ({comments.length})
              </h2>
              {session ? (
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                    placeholder="Write a comment..."
                    className="input flex-1"
                  />
                  <button onClick={handleSubmitComment} className="btn btn-primary">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">
                  <Link to="/login" className="text-brand-600 dark:text-brand-400">Sign in</Link> to join the discussion.
                </p>
              )}
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white text-xs font-semibold flex items-center justify-center">
                        {c.user?.full_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{c.user?.full_name || "Anonymous"}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 pl-10">{c.content}</p>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet. Start the conversation!</p>}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="card p-6 sticky top-20">
              {event.status === "Upcoming" && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Starts in</p>
                  <CountdownTimer targetDate={event.event_date} compact />
                </div>
              )}

              <div className="space-y-3 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Registration Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {event.registration_fee > 0 ? `Rs ${event.registration_fee}` : "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Participants</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{regCount}{event.max_participants > 0 ? ` / ${event.max_participants}` : ""}</span>
                </div>
                {seatsLeft !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Seats Left</span>
                    <span className={cn("font-semibold", seatsLeft > 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                      {seatsLeft > 0 ? seatsLeft : "Full (Waitlist)"}
                    </span>
                  </div>
                )}
                {event.registration_deadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Deadline</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatDate(event.registration_deadline, "short")}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2">
                {isRegistered ? (
                  <>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {registration?.status === "waitlist" ? "On waitlist" : "Registered"}
                    </div>
                    {registration?.status === "registered" && (
                      <button onClick={() => setShowTicket(true)} className="btn btn-secondary w-full">
                        <Download className="w-4 h-4" /> View Ticket
                      </button>
                    )}
                    <button onClick={handleCancelRegistration} className="btn btn-ghost w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <XCircle className="w-4 h-4" /> Cancel Registration
                    </button>
                  </>
                ) : event.status === "Upcoming" ? (
                  <button onClick={handleRegister} disabled={registering} className="btn btn-primary w-full">
                    {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : "Register Now"}
                  </button>
                ) : event.status === "Completed" ? (
                  <p className="text-sm text-gray-500 text-center py-2">Event has ended</p>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">Registration unavailable</p>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={handleBookmark} className={cn("btn btn-secondary px-2", isBookmarked && "text-brand-600 border-brand-300")}>
                    <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                  </button>
                  <button onClick={() => handleShare("whatsapp")} className="btn btn-secondary px-2">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleAddToCalendar} className="btn btn-secondary px-2">
                    <CalendarPlus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => handleShare("copy")} className="text-xs text-gray-500 hover:text-brand-600 w-full text-center">
                  Copy link to share
                </button>
              </div>

              {/* Contact */}
              {(event.contact_email || event.contact_phone) && (
                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-2 text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Organizer</p>
                  {event.contact_email && (
                    <a href={`mailto:${event.contact_email}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-600">
                      <Mail className="w-4 h-4" /> {event.contact_email}
                    </a>
                  )}
                  {event.contact_phone && (
                    <a href={`tel:${event.contact_phone}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-600">
                      <Phone className="w-4 h-4" /> {event.contact_phone}
                    </a>
                  )}
                </div>
              )}

              {event.club_name && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">Organized by</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <UserCircle className="w-4 h-4" /> {event.club_name}
                    {event.department && <span className="text-gray-400">· {event.department}</span>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-4">Related Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedEvents.map((e, i) => (
                <Link key={e.id} to={`/events/${e.slug}`}>
                  <div className="card overflow-hidden group">
                    <div className="h-32 overflow-hidden">
                      {e.banner_image && <img src={e.banner_image} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{e.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(e.event_date, "short")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {showTicket && registration && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowTicket(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Event Ticket</h3>
              <p className="text-sm text-gray-500 mb-4">{event.title}</p>

              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4">
                <div className="flex justify-center mb-3">
                  <div className="bg-white p-3 rounded-xl">
                    <QRCodeSVG value={registration.ticket_code} size={160} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">Ticket Code</p>
                <p className="font-mono font-bold text-lg text-gray-900 dark:text-white">{registration.ticket_code}</p>
                <div className="mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-700 text-left text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900 dark:text-white">{profile?.full_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900 dark:text-white">{formatDate(event.event_date, "short")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium text-gray-900 dark:text-white">{event.venue_name}</span></div>
                </div>
              </div>

              <button onClick={() => window.print()} className="btn btn-primary w-full mt-4">
                <Download className="w-4 h-4" /> Print Ticket
              </button>
              <button onClick={() => setShowTicket(false)} className="btn btn-ghost w-full mt-2">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
