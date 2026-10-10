import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Tag } from "lucide-react";
import type { EventItem } from "@/types";
import { formatDate, getCategoryColor, getEventStatusColor, cn } from "@/lib/utils";

interface Props {
  event: EventItem;
  index?: number;
  variant?: "grid" | "list";
}

export default function EventCard({ event, index = 0, variant = "grid" }: Props) {
  const seatsLeft =
    event.max_participants > 0
      ? event.max_participants - (event.registration_count ?? 0)
      : null;

  if (variant === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.4) }}
      >
        <Link to={`/events/${event.slug}`} className="block">
          <div className="card overflow-hidden flex flex-col sm:flex-row gap-4 p-4 group">
            <div className="sm:w-48 h-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
              {event.banner_image && (
                <img
                  src={event.banner_image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <span className={cn("badge shrink-0", getCategoryColor(event.category))}>
                  {event.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{event.description}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDate(event.event_date, "short")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {event.start_time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {event.venue_name || "TBD"}
                </span>
                {seatsLeft !== null && seatsLeft > 0 && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Users className="w-3.5 h-3.5" /> {seatsLeft} seats left
                  </span>
                )}
              </div>
            </div>
            <div className="sm:self-center shrink-0">
              <span className={cn("badge", getEventStatusColor(event.status))}>{event.status}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
    >
      <Link to={`/events/${event.slug}`} className="block group h-full">
        <div className="card overflow-hidden h-full flex flex-col">
          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
            {event.banner_image && (
              <img
                src={event.banner_image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={cn("badge backdrop-blur-md", getCategoryColor(event.category))}>
                {event.category}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <span className={cn("badge backdrop-blur-md", getEventStatusColor(event.status))}>
                {event.status}
              </span>
            </div>
            {event.is_featured && (
              <div className="absolute bottom-3 left-3">
                <span className="badge bg-accent-500 text-white backdrop-blur-md">
                  <Tag className="w-3 h-3 mr-1" /> Featured
                </span>
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-display font-semibold text-base text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-1">
              {event.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
              {event.description}
            </p>
            <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{formatDate(event.event_date, "short")}</span>
                <Clock className="w-3.5 h-3.5 ml-2 shrink-0" />
                <span>{event.start_time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{event.venue_name || "TBD"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs">
                {event.registration_fee > 0 ? (
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    Rs {event.registration_fee}
                  </span>
                ) : (
                  <span className="font-semibold text-green-600 dark:text-green-400">Free</span>
                )}
                {seatsLeft !== null && seatsLeft > 0 && (
                  <span className="text-gray-400 dark:text-gray-500">
                    &middot; {seatsLeft} left
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                View Details &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
