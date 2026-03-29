import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, User, Slot } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Building,
  Clock,
  Mail,
  Phone,
  Calendar,
  X,
  Check,
  GraduationCap,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function AlumniProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState<User | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmSlot, setConfirmSlot] = useState<Slot | null>(null);

  // ================= LOAD DATA FROM BACKEND =================
  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const alumniRes = await api.getAlumniById(id);
      setAlumni(alumniRes);

      const slotRes = await api.getSlots(id);
      setSlots(slotRes.appointments || []);
    } catch (error) {
      console.error("Failed to load alumni profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // ================= BOOK SLOT =================
  const handleBook = async () => {
    if (!confirmSlot) return;

    const appointmentId = confirmSlot.id || confirmSlot._id;
    if (!appointmentId) {
      toast.error("Invalid slot ID");
      return;
    }

    const result = await api.bookSlot(appointmentId);

    if (!result.ok) {
      toast.error(result.error || "Failed to book appointment");
      return;
    }

    // Show success message
    toast.success("Appointment booked successfully!", {
      description: `You have booked an appointment with ${alumni?.name} on ${confirmSlot.date} at ${confirmSlot.time}`,
    });

    setConfirmSlot(null);
    loadData();
    
    // Navigate back to student home after a short delay
    setTimeout(() => {
      navigate("/student/home");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-32 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Alumni Not Found</h1>
          <p className="mt-2 text-slate-500">The profile you're looking for might have been removed or the URL is incorrect.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-8 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.status === "available");

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Explorations
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100%] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="h-40 w-40 flex-shrink-0 rounded-[3rem] bg-slate-100 flex items-center justify-center text-6xl font-bold text-primary ring-8 ring-slate-50 shadow-xl overflow-hidden self-center md:self-start">
                  {alumni.photoUrl ? (
                    <img src={alumni.photoUrl} alt={alumni.name} className="h-full w-full object-cover" />
                  ) : (
                    alumni.name.charAt(0)
                  )}
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">
                      {alumni.name}
                    </h1>
                    <p className="mt-2 text-xl font-medium text-primary flex items-center justify-center md:justify-start gap-2">
                       <Briefcase className="h-5 w-5" />
                       {alumni.profession}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
                    <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {alumni.company} {alumni.yearsInCurrentCompany ? `(${alumni.yearsInCurrentCompany}y)` : ""}
                      </span>
                    </div>
                    {alumni.location && (
                      <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{alumni.location}</span>
                      </div>
                    )}
                    {alumni.previousCompany && (
                      <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium truncate">Ex: {alumni.previousCompany}</span>
                      </div>
                    )}
                    {(alumni.college || alumni.degree) && (
                      <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {alumni.degree ? `${alumni.degree}` : ""} {alumni.graduationYear ? `'${alumni.graduationYear.toString().slice(-2)}` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {alumni.linkedin && (
                      <a 
                        href={alumni.linkedin} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                         LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                       Verified Alumni
                    </button>
                  </div>
                </div>
              </div>

              {alumni.description && (
                <div className="mt-10 pt-10 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">About Me</h3>
                  <p className="text-lg text-slate-700 leading-relaxed font-medium italic">"{alumni.description}"</p>
                </div>
              )}

              {alumni.skills && alumni.skills.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {alumni.skills.map(skill => (
                      <span key={skill} className="px-4 py-1.5 rounded-xl bg-white text-slate-700 text-xs font-bold border-2 border-slate-50 hover:border-primary/20 transition-colors shadow-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Profile Sidebar / Slots */}
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                Available Slots
              </h3>

              {availableSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Clock className="mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium text-slate-400">
                    No active slots currently.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id || slot._id}
                      onClick={() => setConfirmSlot(slot)}
                      className="group w-full flex items-center justify-between gap-4 rounded-2xl border-2 border-slate-50 p-4 hover:border-primary/30 hover:bg-slate-50/50 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{slot.date}</div>
                          <div className="text-xs font-medium text-slate-500">{slot.time}</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                         Book Now →
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 space-y-4 pt-8 border-t border-slate-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Experience</span>
                    <span className="font-bold text-slate-900">{alumni.totalExperience || 0} Years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Meeting Mode</span>
                    <span className="font-bold text-slate-900">{alumni.meetingMode || "Online"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Rating</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">⭐ 5.0 <span className="text-[10px] text-slate-400 font-normal">(12 reviews)</span></span>
                  </div>
              </div>
            </div>

             <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl shadow-slate-200">
                <h4 className="text-lg font-bold mb-2">Need Help?</h4>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">If you're unable to find a suitable time, you can reach out for a custom request.</p>
                <button className="w-full py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-white/90 transition-all active:scale-95">
                  Request Custom Session
                </button>
             </div>
          </div>
        </div>
      </main>

      {/* BOOK MODAL */}
      {confirmSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-10 shadow-2xl border border-slate-100 scale-in-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary/60" />
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-full bg-primary/5 p-6 text-primary">
                <Calendar className="h-10 w-10 font-bold" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Confirm Booking</h3>
              <p className="text-slate-500 mb-1">Session with <span className="text-primary font-bold">{alumni.name}</span></p>
              <p className="text-sm font-semibold text-slate-800 mb-8">{confirmSlot.date} at {confirmSlot.time}</p>
              
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={handleBook}
                  className="w-full rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => setConfirmSlot(null)}
                  className="w-full rounded-2xl bg-white border-2 border-slate-100 px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
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
