import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Album, Photo } from "@/types";
import Lightbox from "@/components/Lightbox";
import EmptyState from "@/components/EmptyState";
import { Images, ArrowLeft, Calendar, Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Gallery() {
  const { albumId } = useParams();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchAlbums = async () => {
      const { data } = await supabase
        .from("albums")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        const albumsData = data as Album[];
        const withCounts = await Promise.all(
          albumsData.map(async (a) => {
            const { count } = await supabase
              .from("photos")
              .select("id", { count: "exact", head: true })
              .eq("album_id", a.id)
              .eq("approved", true);
            return { ...a, photo_count: count || 0 };
          })
        );
        setAlbums(withCounts);
      }
      setLoading(false);
    };
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (albumId) {
      const fetchPhotos = async () => {
        const { data: album } = await supabase
          .from("albums")
          .select("*")
          .eq("id", albumId)
          .maybeSingle();
        if (album) setSelectedAlbum(album as Album);

        const { data: ph } = await supabase
          .from("photos")
          .select("*")
          .eq("album_id", albumId)
          .eq("approved", true)
          .order("created_at", { ascending: false });
        setPhotos((ph as Photo[]) || []);
      };
      fetchPhotos();
    } else {
      setSelectedAlbum(null);
      setPhotos([]);
    }
  }, [albumId]);

  const categories = ["all", ...Array.from(new Set(albums.map((a) => a.category).filter(Boolean)))];
  const filteredAlbums = filter === "all" ? albums : albums.filter((a) => a.category === filter);

  if (albumId && selectedAlbum) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/gallery" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Gallery
        </Link>
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">{selectedAlbum.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedAlbum.description}</p>
        </div>

        {photos.length === 0 ? (
          <EmptyState icon={<Images className="w-8 h-8" />} title="No photos yet" description="Photos will appear here once uploaded." />
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="break-inside-avoid relative group rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              >
                <img src={photo.url} alt={photo.caption} className="w-full object-cover group-hover:opacity-90 transition-opacity" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="text-white text-xs">
                    {photo.caption && <p className="line-clamp-2">{photo.caption}</p>}
                    <span className="flex items-center gap-1 mt-1"><Heart className="w-3 h-3" /> {photo.likes_count}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {lightboxIndex !== null && (
          <Lightbox photos={photos} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">Photo Gallery</h1>
        <p className="text-gray-500 dark:text-gray-400">Relive memorable moments from past events</p>
      </div>

      {albums.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-48 skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-2/3 rounded-lg skeleton" />
                <div className="h-4 w-1/3 rounded-lg skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAlbums.length === 0 ? (
        <EmptyState icon={<Images className="w-8 h-8" />} title="No albums yet" description="Photo albums will appear here after events." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album, i) => (
            <motion.div key={album.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
              <Link to={`/gallery/${album.id}`}>
                <div className="card overflow-hidden group">
                  <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {album.cover_image && (
                      <img src={album.cover_image} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    )}
                    <div className="absolute bottom-3 right-3">
                      <span className="badge bg-black/50 text-white backdrop-blur-md">{album.photo_count} photos</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{album.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{album.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      {album.category && <span className="badge bg-gray-100 dark:bg-gray-800">{album.category}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {album.year}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
