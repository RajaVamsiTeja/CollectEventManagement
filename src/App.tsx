import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import EventsList from "@/pages/EventsList";
import EventDetail from "@/pages/EventDetail";
import Gallery from "@/pages/Gallery";
import Videos from "@/pages/Videos";
import Calendar from "@/pages/Calendar";
import Clubs from "@/pages/Clubs";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import StudentDashboard from "@/pages/StudentDashboard";
import OrganizerDashboard from "@/pages/OrganizerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/:slug" element={<EventDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/:albumId" element={<Gallery />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated routes */}
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

              {/* Organizer routes */}
              <Route path="/organizer" element={<ProtectedRoute roles={["organizer", "admin"]}><OrganizerDashboard /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#333",
              color: "#fff",
              fontSize: "14px",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
