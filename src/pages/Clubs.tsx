import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Club } from "@/types";
import { Users, Mail, Instagram, Linkedin, Github, Calendar, ArrowRight } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default function Clubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      const { data } = await supabase.from("clubs").select("*").order("name");
      if (data) setClubs(data as Club[]);
      setLoading(false);
    };
    fetchClubs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl skeleton" />
              <div className="h-5 w-2/3 skeleton rounded" />
              <div className="h-4 w-full skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState icon={<Users className="w-8 h-8" />} title="No clubs yet" description="Clubs and committees will be listed here." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">Clubs &amp; Committees</h1>
        <p className="text-gray-500 dark:text-gray-400">Discover the vibrant community of clubs at our college</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club, i) => (
          <motion.div key={club.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}>
            <div className="card overflow-hidden h-full flex flex-col">
              <div className="relative h-28 bg-gradient-to-br from-brand-500 to-accent-500 overflow-hidden">
                {club.cover_image && <img src={club.cover_image} alt="" className="w-full h-full object-cover opacity-30" />}
                <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl bg-white dark:bg-gray-900 shadow-lg flex items-center justify-center overflow-hidden">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-7 h-7 text-brand-500" />
                  )}
                </div>
              </div>
              <div className="p-5 pt-8 flex-1 flex flex-col">
                <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white">{club.name}</h3>
                <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 w-fit mt-1">{club.category}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 flex-1">{club.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {club.members_count} members</p>
                  <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {club.meeting_schedule}</p>
                  <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {club.head_email}</p>
                </div>
                {club.social_links && Object.keys(club.social_links).length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {club.social_links.instagram && (
                      <a href={`https://instagram.com/${club.social_links.instagram}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-pink-500 hover:text-white flex items-center justify-center transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {club.social_links.linkedin && (
                      <a href={`https://linkedin.com/in/${club.social_links.linkedin}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {club.social_links.github && (
                      <a href={`https://github.com/${club.social_links.github}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
