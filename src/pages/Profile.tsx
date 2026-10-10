import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { User, Mail, Building2, GraduationCap, Hash, Phone, Save, Loader2, Camera } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [department, setDepartment] = useState(profile?.department || "");
  const [year, setYear] = useState(profile?.year || "");
  const [rollNumber, setRollNumber] = useState(profile?.roll_number || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        department,
        year,
        roll_number: rollNumber,
        phone,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      await refreshProfile();
      toast.success("Profile updated!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">My Profile</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Update your personal information</p>

      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white text-2xl font-bold flex items-center justify-center overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : (fullName?.charAt(0).toUpperCase() || "U")}
            </div>
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white">{profile?.email}</h2>
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 capitalize mt-1">{profile?.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input pl-10" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="input pl-10" placeholder="Computer Science" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={year} onChange={(e) => setYear(e.target.value)} className="input pl-10" placeholder="3rd Year" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Roll Number</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="input pl-10" placeholder="CS21B001" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input pl-10" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Avatar URL</label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="input pl-10" placeholder="https://..." />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input min-h-[80px]" placeholder="Tell us about yourself..." />
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary mt-6">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
