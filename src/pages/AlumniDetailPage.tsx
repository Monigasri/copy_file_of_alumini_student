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
  Calendar,
  X,
  Check,
  GraduationCap,
  ExternalLink,
  Loader2,
  CalendarPlus,
  Mail,
} from "lucide-react";

export default function AlumniDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState<User | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmSlot, setConfirmSlot] = useState<Slot | null>(null);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  // ================= LOAD DATA FROM BACKEND =================
  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const alumniRes = await api.getAlumniById(id);
      if (alumniRes) {
        setAlumni(alumniRes);
        const slotRes = await api.getSlots(id);
        setSlots(slotRes.appointments || []);
      } else {
        setAlumni(null);
      }
    } catch (error) {
      console.error("Failed to load alumni profile:", error);
      setAlumni(null);
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

    toast.success("Appointment booked successfully!", {
      description: `You have booked a session with ${alumni?.name} on ${confirmSlot.date} at ${confirmSlot.time}`,
    });

    setConfirmSlot(null);
    loadData();

    setTimeout(() => {
      navigate("/student/home");
    }, 1800);
  };

  const handleSendMessage = () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (user.role !== "student") {
      toast.info("Only students can send messages to alumni.");
      return;
    }

    setShowMessageModal(true);
  };

  const sendMessage = async () => {
    if (!user || user.role !== "student" || !id) return;
    if (!messageText.trim()) {
      toast.error("Please type a message");
      return;
    }

    const result = await api.sendMessageToAlumni(id, messageText.trim());
    if (!result.ok) {
      toast.error(result.error || "Failed to send message");
      return;
    }

    setShowMessageModal(false);
    setMessageText("");
    toast.success("Message sent!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="font-medium animate-pulse text-blue-900/60">Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-32 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
            <X className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Mentor Not Found</h1>
          <p className="mt-4 text-slate-600 text-lg">
            The profile you're looking for might have been removed or the link is incorrect.
          </p>
          <button
            onClick={() => navigate("/student/home")}
            className="mt-8 rounded-2xl bg-blue-600 px-10 py-4 text-white font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.status === "available");

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-white to-cream-50/40">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Mentors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
          {/* LEFT - Profile Info */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-3xl bg-white p-8 lg:p-10 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
                <div className="relative group">
                  <div className="h-44 w-44 lg:h-52 lg:w-52 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                    {alumni.photoUrl ? (
                      <img
                        src={alumni.photoUrl}
                        alt={alumni.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 text-6xl font-bold">
                        {alumni.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-5 text-center md:text-left">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
                      {alumni.name}
                    </h1>
                    <p className="mt-2 text-xl text-blue-700 font-medium">
                      {alumni.profession}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">

                    {alumni.email && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-800 text-sm font-medium">
                         <Mail className="h-4 w-4" />
                         {alumni.email}
                       </div>
                    )}

                    {alumni.phone && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-800 text-sm font-medium">
                        📞 {alumni.phone}
                      </div>
                    )}

                    {alumni.company && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-800 text-sm font-medium">
                        <Building className="h-4 w-4" />
                        {alumni.company}
                      </div>
                    )}
                    {alumni.location && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-800 text-sm font-medium">
                        <MapPin className="h-4 w-4" />
                        {alumni.location}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                    {alumni.linkedin && (
                      <a
                        href={alumni.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-all shadow-sm"
                      >
                        View LinkedIn <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-800 rounded-2xl font-medium border border-green-100">
                      <Check className="h-4 w-4" /> Verified Mentor
                    </div>
                  </div>
                </div>
              </div>

              {alumni.description && (
                <div className="mt-12 pt-10 border-t border-slate-100">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-4">
                    About
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    {alumni.description}
                  </p>
                </div>
              )}

              {alumni.skills?.length > 0 && (
                <div className="mt-10 pt-10 border-t border-slate-100">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-5">
                    Skills & Expertise
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {alumni.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-5 py-2 bg-blue-50 text-blue-800 rounded-2xl text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Education */}
            {(alumni.degree || alumni.college) && (
              <div className="rounded-3xl bg-white p-8 lg:p-10 shadow-sm border border-slate-100">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-6">
                  Education
                </h3>
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900">{alumni.degree}</h4>
                    <p className="text-slate-700">{alumni.college}</p>
                    {alumni.graduationYear && (
                      <p className="mt-2 inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                        Class of {alumni.graduationYear}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - Booking Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-8">
              {/* Booking Card */}
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <CalendarPlus className="h-6 w-6 text-blue-600" />
                  Available Sessions
                </h3>

                {availableSlots.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Clock className="mx-auto h-10 w-10 mb-4 opacity-70" />
                    <p className="font-medium">No available slots right now</p>
                    <p className="mt-2 text-sm">Check back later or send a direct request</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id || slot._id}
                        onClick={() => setConfirmSlot(slot)}
                        className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3.5 rounded-2xl bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{slot.date}</div>
                            <div className="text-sm text-slate-600">{slot.time}</div>
                          </div>
                        </div>
                        <span className="text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                          Book →
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience</span>
                    <span className="font-semibold text-slate-800">
                      {alumni.totalExperience || "?"} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Meeting Mode</span>
                    <span className="font-semibold text-slate-800">
                      {alumni.meetingMode || "Online"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Message / Custom Request */}
              <div className="rounded-3xl bg-blue-50/60 p-8 border border-blue-100 shadow-sm text-center">
                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 text-blue-700">
                  <Mail className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">
                  Need a custom time?
                </h4>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Send a direct message to discuss availability and session details.
                </p>
                <button
                  onClick={handleSendMessage}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all shadow-sm"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <CalendarPlus className="h-8 w-8" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Confirm Booking
              </h3>

              <p className="text-slate-600 mb-8">
                Book session with <strong>{alumni.name}</strong> on
                <br />
                <span className="font-semibold text-blue-700 mt-2 inline-block">
                  {confirmSlot.date} at {confirmSlot.time}
                </span>
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConfirmSlot(null)}
                  className="py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  className="py-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h3 className="text-2xl font-bold text-slate-900">Send Message</h3>
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                Close
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Message <strong>{alumni?.name || "alumni"}</strong> to discuss session details.
            </p>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your message..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[120px]"
            />

            <div className="mt-5 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={sendMessage}
                className="py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}