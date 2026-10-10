import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date, format: "short" | "long" | "full" = "long"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  if (format === "short") {
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  if (format === "full") {
    return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatTime(time: string): string {
  if (!time) return "";
  return time;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVT-${code}`;
}

export function getInstagramEmbedUrl(url: string): string {
  const match = url.match(/instagram\.com\/(?:reel|p|tv)\/([^/]+)/);
  if (match) {
    return `https://www.instagram.com/p/${match[1]}/embed`;
  }
  return url;
}

export function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export function isValidInstagramUrl(url: string): boolean {
  return /instagram\.com\/(reel|p|tv)\//.test(url);
}

export function isValidYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
}

export function getEventStatusColor(status: string): string {
  switch (status) {
    case "Upcoming":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "Ongoing":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "Completed":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    case "Cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  }
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Technical: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    Cultural: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    Sports: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800",
    Workshop: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    Seminar: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    Hackathon: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800",
    Fest: "bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    "Club Activity": "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  };
  return colors[category] || colors["Technical"];
}

export function getSponsorTierColor(tier: string): string {
  switch (tier) {
    case "Gold":
      return "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20";
    case "Silver":
      return "border-gray-300 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-800";
    case "Bronze":
      return "border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20";
    default:
      return "border-gray-300 bg-gray-50";
  }
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
}

export function relativeTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
