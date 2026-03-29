import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Pencil, 
  Save, 
  X, 
  ArrowLeft, 
  Loader2, 
  Camera, 
  Upload, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Photo-related states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({ ...user });
      setPreviewUrl(user.photoUrl || null);
    }
  }, [user]);

  if (!user) return null;

  const handleBack = () => {
    if (editing) {
      setShowConfirm(true);
    } else {
      navigate(-1);
    }
  };

  const confirmBack = () => {
    setEditing(false);
    setShowConfirm(false);
    navigate(-1);
  };

  // ================= PHOTO HANDLERS =================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error("File size is too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewPhotoBase64(base64String);
      setPreviewUrl(base64String);
      setForm({ ...form, photoUrl: base64String });
      toast.info("Photo updated. Click Save to permanently update your profile.");
    };
    reader.readAsDataURL(file);
  };

  const cancelPhotoUpdate = () => {
    setPreviewUrl(user.photoUrl || null);
    setNewPhotoBase64(null);
    setForm({ ...form, photoUrl: user.photoUrl });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    setNewPhotoBase64(null);
    setForm({ ...form, photoUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ================= SAVE HANDLER =================
  const handleSave = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        // Ensure numeric fields are numbers
        totalExperience: form.totalExperience !== undefined ? Number(form.totalExperience) : undefined,
        yearsInCurrentCompany: form.yearsInCurrentCompany !== undefined ? Number(form.yearsInCurrentCompany) : undefined,
        graduationYear: form.graduationYear !== undefined ? Number(form.graduationYear) : undefined,
        cgpa: form.cgpa !== undefined ? Number(form.cgpa) : undefined,
        // Ensure skills/areas are arrays if they are strings (from input)
        skills: typeof form.skills === "string" ? form.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : form.skills,
        areaOfInterest: typeof form.areaOfInterest === "string" ? form.areaOfInterest.split(",").map((s: string) => s.trim()).filter(Boolean) : form.areaOfInterest
      };

      const result = await api.updateProfile(user.id, payload);

      if (result.ok && result.data) {
        updateUser(result.data);
        setEditing(false);
        setNewPhotoBase64(null);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const alumniFields = [
    { key: "name", label: "Full Name", icon: <Pencil className="w-4 h-4" /> },
    { key: "phone", label: "Phone", icon: <Phone className="w-4 h-4" /> },
    { key: "location", label: "Location", icon: <MapPin className="w-4 h-4" /> },
    { key: "profession", label: "Profession", icon: <Briefcase className="w-4 h-4" /> },
    { key: "company", label: "Current Company", icon: <Briefcase className="w-4 h-4" /> },
    { key: "previousCompany", label: "Previous Company", icon: <Briefcase className="w-4 h-4" /> },
    { key: "industry", label: "Industry", icon: <Briefcase className="w-4 h-4" /> },
    { key: "yearsInCurrentCompany", label: "Years in Company", type: "number", icon: <Briefcase className="w-4 h-4" /> },
    { key: "totalExperience", label: "Total Experience", type: "number", icon: <Briefcase className="w-4 h-4" /> },
    { key: "linkedin", label: "LinkedIn URL", icon: <Pencil className="w-4 h-4" /> },
    { key: "skills", label: "Skills (comma separated)", type: "text", isArray: true, icon: <Pencil className="w-4 h-4" /> },
    { key: "college", label: "College / University", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "degree", label: "Degree", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "graduationYear", label: "Graduation Year", type: "number", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "meetingMode", label: "Meeting Mode", icon: <Pencil className="w-4 h-4" /> },
    { key: "description", label: "Bio", type: "textarea", icon: <Pencil className="w-4 h-4" /> },
  ];

  const studentFields = [
    { key: "name", label: "Full Name", icon: <Pencil className="w-4 h-4" /> },
    { key: "phone", label: "Phone", icon: <Phone className="w-4 h-4" /> },
    { key: "location", label: "Location", icon: <MapPin className="w-4 h-4" /> },
    { key: "college", label: "College / University", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "degree", label: "Degree", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "department", label: "Department", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "year", label: "Current Year",type: "select", options: ["1st", "2nd", "3rd", "4th", "Graduated"], icon: <GraduationCap className="w-4 h-4" /> },
    { key: "cgpa", label: "CGPA", type: "number", icon: <Pencil className="w-4 h-4" /> },
    { key: "graduationYear", label: "Graduation Year", type: "number", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "skills", label: "Skills (comma separated)", type: "text", isArray: true, icon: <Pencil className="w-4 h-4" /> },
    { key: "areaOfInterest", label: "Interests (comma separated)", type: "text", isArray: true, icon: <Pencil className="w-4 h-4" /> },
    { key: "linkedin", label: "LinkedIn URL", icon: <Pencil className="w-4 h-4" /> },
    { key: "github", label: "GitHub URL", icon: <Pencil className="w-4 h-4" /> },
    { key: "mentorshipDomain", label: "Mentorship Domain", icon: <Pencil className="w-4 h-4" /> },
    { key: "meetingMode", label: "Meeting Mode", icon: <Pencil className="w-4 h-4" /> },
    { key: "description", label: "Bio", type: "textarea", icon: <Pencil className="w-4 h-4" /> },
  ];

  const fields = user.role === "alumni" ? alumniFields : studentFields;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        
        {/* Navigation & Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <button
              onClick={handleBack}
              className="group mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              Back
            </button>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">
              {editing ? "Edit Profile" : "My Profile"}
            </h1>
            <p className="mt-2 text-slate-500">
              {editing ? "Keep your information up to date to help others find you." : "View and manage your profile information."}
            </p>
          </div>

          <div className="flex gap-3">
            {!editing ? (
              <button 
                type="button" 
                onClick={() => { setForm({ ...user }); setEditing(true); }} 
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 shadow-[0_8px_30px_rgb(20,184,166,0.2)] transition-all active:scale-95"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={handleSave} 
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 shadow-[0_8px_30px_rgb(20,184,166,0.2)] transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setEditing(false);
                    setForm({ ...user });
                    setPreviewUrl(user.photoUrl || null);
                    setNewPhotoBase64(null);
                  }} 
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-8">
            <div className="relative group rounded-3xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/10 to-primary/5 -z-0" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-5xl font-bold text-primary ring-4 ring-white shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-300">
                    {previewUrl ? (
                      <img src={previewUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  
                  {editing && (
                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 rounded-2xl bg-primary text-white shadow-lg hover:scale-110 transition-transform active:scale-95"
                        title="Upload Photo"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      {newPhotoBase64 && (
                        <button
                          type="button"
                          onClick={cancelPhotoUpdate}
                          className="p-2.5 rounded-2xl bg-white text-slate-500 border border-slate-100 shadow-lg hover:text-red-500 transition-colors"
                          title="Undo selection"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {previewUrl && !newPhotoBase64 && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="p-2.5 rounded-2xl bg-white text-slate-500 border border-slate-100 shadow-lg hover:text-red-500 transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    {user.role}
                  </span>
                </div>

                <div className="mt-8 w-full space-y-4 pt-8 border-t border-slate-50">
                   <div className="flex items-center gap-3 text-slate-600">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-sm truncate">{user.email}</span>
                   </div>
                   {user.phone && (
                     <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-2 rounded-lg bg-slate-50">
                          <Phone className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{user.phone}</span>
                     </div>
                   )}
                   {user.location && (
                     <div className="flex items-center gap-3 text-slate-600">
                        <div className="p-2 rounded-lg bg-slate-50">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="text-sm">{user.location}</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Fields Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                Personal Details
              </h3>
              
              <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
                {fields.map(field => (
                  <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-slate-400">{field.icon}</span>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {field.label}
                      </label>
                    </div>
                    
                    {editing ? (
                      field.type === "textarea" ? (
                        <textarea
                          value={(form as any)[field.key] || ""}
                          onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all outline-none min-h-[140px]"
                          disabled={field.disabled}
                          placeholder={`Enter your ${field.label.toLowerCase()}...`}
                        />
                      ) : (
                        field.type === "select" ? (
  <select
    value={(form as any)[field.key] || ""}
    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all outline-none"
  >
    <option value="">Select {field.label}</option>
    {field.options.map((opt: string) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
) : (
  <input
    type={field.type || "text"}
    value={field.isArray && Array.isArray((form as any)[field.key]) 
      ? (form as any)[field.key].join(", ") 
      : (form as any)[field.key] || ""}
    onChange={e => setForm({ 
      ...form, 
      [field.key]: e.target.value
    })}
    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-700 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all outline-none disabled:opacity-50"
    disabled={field.disabled}
    placeholder={`Enter your ${field.label.toLowerCase()}...`}
  />
)
                      )
                    ) : (
                      <div className="group rounded-2xl bg-slate-50/70 p-4 text-sm font-medium text-slate-700 border border-slate-100/50 group-hover:bg-slate-100 transition-colors">
                         {field.isArray && Array.isArray((user as any)[field.key]) 
                            ? (user as any)[field.key].join(", ") || <span className="text-slate-300 italic">Not set</span>
                            : (user as any)[field.key] || <span className="text-slate-300 italic">Not set</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-10 shadow-2xl border border-slate-100 scale-in-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-400" />
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-full bg-red-50 p-4">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Unsaved Changes</h3>
              <p className="text-slate-500 mb-8">
                You have pending changes that will be lost if you leave. Are you sure?
              </p>
              
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={confirmBack}
                  className="w-full rounded-2xl bg-red-500 px-6 py-4 text-sm font-bold text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full rounded-2xl bg-white border-2 border-slate-100 px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes scale-in-center {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .scale-in-center {
          animation: scale-in-center 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
