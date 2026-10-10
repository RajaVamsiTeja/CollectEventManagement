import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  CalendarDays,
  Images,
  Video,
  Users,
  Info,
  Mail,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  LogOut,
  LayoutDashboard,
  User,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const publicLinks = [
  { to: "/", label: "Home", icon: CalendarDays },
  { to: "/events", label: "Events", icon: CalendarDays },
  { to: "/gallery", label: "Gallery", icon: Images },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/clubs", label: "Clubs", icon: Users },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Mail },
];

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const dashboardLink =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "organizer"
      ? "/organizer"
      : "/dashboard";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800"
            : "bg-white dark:bg-gray-950 border-b border-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-brand-600 dark:text-brand-400">
              <GraduationCap className="w-7 h-7" />
              <span className="hidden sm:inline">CampusEvents</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {publicLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === link.to || (link.to !== "/" && location.pathname.startsWith(link.to))
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20"
                      : "text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {profile ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
                      {profile.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 card overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="font-medium text-sm truncate">{profile.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                          <span className="badge mt-1 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 capitalize">
                            {profile.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link to={dashboardLink} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          <Link to="/notifications" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Bell className="w-4 h-4" /> Notifications
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="btn btn-ghost">Sign In</Link>
                  <Link to="/register" className="btn btn-primary">Sign Up</Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {publicLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <link.icon className="w-4 h-4 text-gray-500" />
                    {link.label}
                  </Link>
                ))}
                {!profile && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                    <Link to="/login" className="btn btn-secondary flex-1">Sign In</Link>
                    <Link to="/register" className="btn btn-primary flex-1">Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="h-16" />
    </>
  );
}
