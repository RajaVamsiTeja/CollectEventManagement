import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Video } from "@/types";
import EmptyState from "@/components/EmptyState";
import { Video as VideoIcon, Instagram, Youtube, ExternalLink, Filter, Play } from "lucide-react";
import { cn, getInstagramEmbedUrl, getYouTubeEmbedUrl } from "@/lib/utils";

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (data) setVideos(data as Video[]);
      setLoading(false);
    };
    fetchVideos();
  }, []);

  const categories = ["all", ...Array.from(new Set(videos.map((v) => v.category).filter(Boolean)))];
  const filtered = filter === "all" ? videos : videos.filter((v) => v.category === filter);
  const featured = filtered.find((v) => v.is_featured) || filtered[0];
  const rest = filtered.filter((v) => v.id !== featured?.id);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-48 skeleton rounded-lg mb-8" />
        <div className="h-80 skeleton rounded-2xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-40 skeleton" />
              <div className="p-4 space-y-2"><div className="h-4 w-2/3 skeleton rounded" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState icon={<VideoIcon className="w-8 h-8" />} title="No videos yet" description="Event highlights and reels will appear here." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">Videos</h1>
          <p className="text-gray-500 dark:text-gray-400">Watch event highlights, reels and campus videos</p>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="btn btn-accent"
        >
          <Instagram className="w-4 h-4" /> Follow Us
        </a>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Filter className="w-4 h-4 text-gray-400 mt-1.5" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all",
                filter === cat
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Featured Video */}
      {featured && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {playingId === featured.id ? (
                  <iframe
                    src={featured.platform === "instagram" ? getInstagramEmbedUrl(featured.url) : getYouTubeEmbedUrl(featured.url)}
                    className="w-full h-full"
                    allowFullScreen
                    title={featured.title}
                  />
                ) : (
                  <button onClick={() => setPlayingId(featured.id)} className="relative w-full h-full group">
                    <img src={featured.thumbnail} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-brand-600 ml-1" />
                      </div>
                    </div>
                    {featured.is_featured && (
                      <span className="absolute top-3 left-3 badge bg-accent-500 text-white">Featured</span>
                    )}
                  </button>
                )}
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  {featured.platform === "instagram" ? (
                    <Instagram className="w-5 h-5 text-pink-500" />
                  ) : (
                    <Youtube className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-xs font-medium text-gray-500 capitalize">{featured.platform}</span>
                  {featured.category && <span className="badge bg-gray-100 dark:bg-gray-800">{featured.category}</span>}
                </div>
                <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">{featured.title}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{featured.description}</p>
                <div className="flex gap-3">
                  <a href={featured.url} target="_blank" rel="noreferrer" className="btn btn-secondary text-sm">
                    <ExternalLink className="w-4 h-4" /> Open Original
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Video Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((video, i) => (
            <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
              <div className="card overflow-hidden group">
                <div className="relative aspect-video bg-black">
                  {playingId === video.id ? (
                    <iframe
                      src={video.platform === "instagram" ? getInstagramEmbedUrl(video.url) : getYouTubeEmbedUrl(video.url)}
                      className="w-full h-full"
                      allowFullScreen
                      title={video.title}
                    />
                  ) : (
                    <button onClick={() => setPlayingId(video.id)} className="relative w-full h-full group">
                      {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-brand-600 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        {video.platform === "instagram" ? (
                          <span className="badge bg-pink-500 text-white"><Instagram className="w-3 h-3 mr-1" /> Reel</span>
                        ) : (
                          <span className="badge bg-red-500 text-white"><Youtube className="w-3 h-3 mr-1" /> YouTube</span>
                        )}
                      </div>
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{video.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{video.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
