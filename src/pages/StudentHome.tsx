import { useState, useEffect } from "react";
import { api, User, Slot, Message, MessageThreadAlumni } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AlumniCard from "@/components/AlumniCard";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Clock,
  User as UserIcon,
  MessageSquare,
  Send,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [alumni, setAlumni] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<(Slot & { alumniName?: string })[]>([]);
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  // ================= MESSAGES =================
  const [messageThreads, setMessageThreads] = useState<MessageThreadAlumni[]>([]);
  const [activeMessageOther, setActiveMessageOther] = useState<{
    alumniId: string;
    alumniName: string;
    alumniPhotoUrl?: string | null;
  } | null>(null);
  const [messageThreadMessages, setMessageThreadMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showMessageThread, setShowMessageThread] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);

  // ================= FETCH ALUMNI =================
  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await api.getAlumni(search || undefined);
      if (response && Array.isArray(response.alumni)) {
        setAlumni(response.alumni);
      } else {
        setAlumni([]);
      }
    } catch (error) {
      console.error("Error fetching alumni:", error);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH BOOKINGS =================
  const fetchMyBookings = async () => {
    const res = await api.getHistory();
    if (res.ok) {
      const upcoming = res.appointments.filter(
        (a: Slot) =>
          (a.status === "booked" || a.status === "approved") &&
          new Date(`${a.date}T${a.time}`) > new Date()
      );
      setBookedSlots(upcoming);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [search]);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchMyBookings();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // ================= LOAD MESSAGE THREADS =================
  const loadMessageThreads = async () => {
    if (!user) return;

    try {
      setLoadingThreads(true);
      const res = await api.getMessageThreads();
      if (res.ok) setMessageThreads(res.threads || []);
      else setMessageThreads([]);
    } catch (error) {
      console.error("Failed to load message threads:", error);
      setMessageThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    loadMessageThreads();
  }, [user]);

  const openMessageThread = async (alumniId: string) => {
    const res = await api.getMessageThread(alumniId);
    if (!res.ok) {
      alert(res.error || "Failed to load messages");
      return;
    }
    if (!res.other) return;

    setActiveMessageOther(res.other);
    setMessageThreadMessages(res.messages || []);
    setMessageText("");
    setShowMessageThread(true);
  };

  const sendMessage = async () => {
    if (!activeMessageOther) return;
    if (!messageText.trim()) return;

    const res = await api.sendMessageToAlumni(
      activeMessageOther.alumniId,
      messageText.trim()
    );

    if (!res.ok) {
      alert(res.error || "Failed to send message");
      return;
    }

    await openMessageThread(activeMessageOther.alumniId);
    await loadMessageThreads();
  };

  const confirmedCount = bookedSlots.filter((s) => s.status === "approved").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Back + Greeting */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

  {/* LEFT SIDE */}
  <button
    onClick={() => navigate(-1)}
    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
  >
    <ArrowLeft className="h-4 w-4" />
    Back
  </button>

  
</div>
        <div className="flex items-start justify-between mb-6">

  {/* LEFT SIDE - GREETING */}
  <div>
    <h1 className="text-2xl font-bold text-slate-800">
      Hello, {user?.name || "Student"} 👋
    </h1>
    <p className="mt-1 text-sm text-slate-500">
      Discover alumni mentors and manage your upcoming sessions
    </p>
  </div>

  {/* RIGHT SIDE - MESSAGES BUTTON */}
  <div className="relative">
    <button
      onClick={() => setShowMessagePopup(!showMessagePopup)}
      className="relative flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 shadow-sm text-sm font-medium text-indigo-700"
    >
      <MessageSquare className="h-5 w-5 text-indigo-600" />
      Messages

      {messageThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
          {messageThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)}
        </span>
      )}
    </button>

    {/* POPUP */}
    {showMessagePopup && (
      <div className="absolute right-0 top-12 w-80 bg-white border rounded-xl shadow-lg p-4 z-50">
        <h3 className="font-semibold text-indigo-700 mb-3">
          Messages
        </h3>

        {loadingThreads ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : messageThreads.length === 0 ? (
          <p className="text-sm text-slate-500">No messages</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {messageThreads.map((t) => (
              <div
                key={t.alumniId}
                onClick={() => {
                  openMessageThread(t.alumniId);
                  setShowMessagePopup(false);
                }}
                className="cursor-pointer p-3 rounded-lg hover:bg-indigo-50 border"
              >
                <p className="font-medium text-sm">
                  {t.alumniName}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  {t.lastMessage}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>

</div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN - Alumni Search + List */}
          <div className="lg:col-span-8 space-y-8">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, profession, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-5 py-3.5 shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 
                           transition duration-200 placeholder:text-slate-400"
              />
            </div>

            {/* Alumni Section */}
<section>
  <h2 className="mb-6 text-2xl font-semibold text-slate-800 flex items-center gap-2">
    Available Mentors
    <span className="text-sm font-normal text-slate-500">
      ({alumni.length})
    </span>
  </h2>

  {loading ? (
    <div className="py-24 text-center text-slate-400 animate-pulse">
      Loading mentors...
    </div>
  ) : alumni.length === 0 ? (
    <div className="py-24 text-center">
      <p className="text-slate-500">
        No alumni found matching your search.
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Try different keywords
      </p>
    </div>
  ) : (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {alumni.map((a) => (
        <div
          key={a.id}
          onClick={() => navigate(`/alumni/${a.id}`)}
          className="
            group
            bg-white
            rounded-3xl
            border border-slate-200
            shadow-sm
            hover:shadow-2xl
            transition-all duration-300
            hover:-translate-y-2
            cursor-pointer
            p-8
            flex flex-col
            justify-between
            min-h-[340px]
          "
        >
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="
  h-24 w-24
  rounded-full
  overflow-hidden
  shadow-md
  group-hover:scale-105
  transition
">
  {a.photoUrl ? (
    <img
      src={a.photoUrl}
      alt={a.name}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="
      h-full w-full
      bg-gradient-to-br from-indigo-100 to-indigo-200
      flex items-center justify-center
      text-indigo-600
      text-3xl font-bold
    ">
      {a.name?.charAt(0)}
    </div>
  )}
</div>

            <h3 className="mt-5 text-xl font-semibold text-slate-800">
              {a.name}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {a.profession || "Professional"}
            </p>

            {a.company && (
              <p className="text-sm text-slate-500">
                {a.company}
              </p>
            )}
          </div>

          {/* Bottom Info */}
          <div className="mt-6 text-sm text-slate-500 space-y-3 text-center">
            {a.location && (
              <p>{a.location}</p>
            )}

            {a.totalExperience && (
              <span className="
                inline-block
                px-4 py-1.5
                rounded-full
                bg-indigo-50
                text-indigo-600
                text-xs
                font-medium
              ">
                {a.totalExperience} yrs experience
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</section>
          </div>

          {/* RIGHT COLUMN - Upcoming Sessions Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Summary Card */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Your Sessions
                    </h3>
                    {bookedSlots.length > 0 && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {bookedSlots.length}
                      </span>
                    )}
                  </div>
                </div>

                {bookedSlots.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Clock className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="font-medium">No upcoming sessions</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Book a mentoring session to get started
                    </p>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    {bookedSlots.map((slot) => (
                      <div
                        key={slot.id || slot._id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-slate-100 
                                   transition duration-200 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{slot.date}</p>
                              <p className="text-sm text-slate-600">{slot.time}</p>
                            </div>
                          </div>

                          <div>
                            {slot.status === "approved" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Confirmed
                              </span>
                            )}
                            {slot.status === "booked" && (
                              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pl-[52px]">
                          <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-slate-700">
                              {slot.alumniName || "Alumni Mentor"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              

              {/* Optional small confirmed count banner */}
              {/* {confirmedCount > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 p-4 text-sm">
                  <p className="font-medium text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    You have {confirmedCount} confirmed session{confirmedCount > 1 ? "s" : ""}
                  </p>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </main>

      {/* ================= MESSAGE THREAD MODAL ================= */}
      {showMessageThread && activeMessageOther && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4"
          onClick={() => setShowMessageThread(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                  {activeMessageOther.alumniPhotoUrl ? (
                    <img
                      src={activeMessageOther.alumniPhotoUrl}
                      alt={activeMessageOther.alumniName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-700 font-bold">
                      {activeMessageOther.alumniName?.charAt(0) || "A"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-700">
                    Messages
                  </h3>
                  <p className="text-sm text-slate-600">
                    {activeMessageOther.alumniName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMessageThread(false)}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                Close
              </button>
            </div>

            <div className="max-h-[340px] overflow-y-auto pr-2 space-y-3">
              {messageThreadMessages.length === 0 ? (
                <p className="text-slate-500 text-sm">No messages yet.</p>
              ) : (
                messageThreadMessages.map((m) => (
                  <div
                    key={m._id || m.id || `${m.createdAt}-${m.senderRole}`}
                    className={`flex ${m.senderRole === "student" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap border ${
                        m.senderRole === "student"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-100 text-slate-800 border-slate-200"
                      }`}
                    >
                      {m.content}
                      <div className="text-[10px] mt-1 opacity-70 text-right">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex items-end gap-3">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 min-h-[44px] max-h-[140px] resize-none border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!messageText.trim()}
                className="h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}