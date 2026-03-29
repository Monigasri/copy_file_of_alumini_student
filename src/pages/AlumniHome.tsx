import { useState, useEffect } from "react";
import { api, Slot, Message, MessageThreadStudent } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Send,
} from "lucide-react";

export default function AlumniHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  const [rejectSlot, setRejectSlot] = useState<Slot | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectReason, setShowRejectReason] = useState(false);

  // ================= MESSAGES =================
  const [messageThreads, setMessageThreads] = useState<MessageThreadStudent[]>([]);
  const [activeMessageOther, setActiveMessageOther] = useState<{
    studentId: string;
    studentName: string;
    studentPhotoUrl?: string | null;
  } | null>(null);
  const [messageThreadMessages, setMessageThreadMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showMessageThread, setShowMessageThread] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);

  // ================= LOAD SLOTS =================
  const loadSlots = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await api.getSlots(user.id);
      setSlots(result.appointments || []);
    } catch (error) {
      console.error("Failed to load slots:", error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [user]);

  // ================= LOAD MESSAGE THREADS =================
  const loadMessageThreads = async () => {
    if (!user) return;

    try {
      setLoadingThreads(true);
      const res = await api.getMessageThreads();
      if (res.ok) {
        setMessageThreads(res.threads || []);
      } else {
        setMessageThreads([]);
      }
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

  const openMessageThread = async (studentId: string) => {
    const res = await api.getMessageThread(studentId);
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

  const sendMessageReply = async () => {
    if (!activeMessageOther) return;
    if (!messageText.trim()) return;

    const res = await api.sendMessageToStudent(
      activeMessageOther.studentId,
      messageText.trim()
    );

    if (!res.ok) {
      alert(res.error || "Failed to send message");
      return;
    }

    await openMessageThread(activeMessageOther.studentId);
    await loadMessageThreads();
  };

  // ================= ADD SLOT =================
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const slotDateTime = new Date(`${newDate}T${newTime}`);
    if (slotDateTime <= new Date()) {
      alert("Invalid time: Cannot select past time");
      return;
    }

    const result = await api.addSlot(newDate, newTime);

    if (!result.ok) {
      alert(result.error || "Failed to add slot");
      return;
    }

    alert("Slot added successfully");
    setNewDate("");
    setNewTime("");
    setShowAdd(false);
    loadSlots();
  };

  // ================= REJECT =================
  const handleReject = async () => {
    if (!rejectSlot) return;

    const result = await api.rejectBooking(
      rejectSlot.id || rejectSlot._id || "",
      rejectReason
    );

    if (!result.ok) {
      alert(result.error);
      return;
    }

    setRejectSlot(null);
    setRejectReason("");
    setShowRejectReason(false);
    loadSlots();
  };

  // ================= APPROVE =================
  const handleApprove = async (slotId: string) => {
    const result = await api.approveBooking(slotId);

    if (!result.ok) {
      alert(result.error || "Failed to accept booking");
      return;
    }

    alert("Booking accepted successfully!");
    setRejectSlot(null);
    loadSlots();
  };

  const now = new Date();

  const activeSlots = slots.filter((s) => {
    const slotDateTime = new Date(`${s.date}T${s.time}`);
    return (
      slotDateTime > now &&
      (s.status === "available" ||
        s.status === "booked" ||
        s.status === "approved")
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Alumni Dashboard
            </h1>
            <p className="text-slate-500">
              Manage your mentoring appointments
            </p>
          </div>

         <div className="flex items-center gap-4 relative">

  {/* MESSAGE ICON */}
  <button
  onClick={() => setShowMessagePopup(!showMessagePopup)}
  className="relative flex items-center gap-2 px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 shadow-sm text-sm font-medium text-indigo-700"
>
  <MessageSquare className="h-5 w-5 text-indigo-600" />
  Messages

  {/* UNREAD BADGE */}
  {messageThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
      {messageThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)}
    </span>
  )}
</button>

  {/* ADD SLOT BUTTON */}
  <button
    type="button"
    onClick={() => setShowAdd(true)}
    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
  >
    <Plus className="h-4 w-4" /> Add Slot
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
              key={t.studentId}
              onClick={() => {
                openMessageThread(t.studentId);
                setShowMessagePopup(false);
              }}
              className="cursor-pointer p-3 rounded-lg hover:bg-indigo-50 border"
            >
              <p className="font-medium text-sm">
                {t.studentName}
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

        {/* ================= DASHBOARD 3:1 LAYOUT ================= */}
        {loading ? (
          <div className="py-16 text-center">Loading slots...</div>
        ) : (
          <div className="grid grid-cols-4 gap-8">
            {/* LEFT PANEL */}
            <div className="col-span-3 space-y-10">
              {/* CONFIRMED */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Upcoming Confirmed Sessions
                </h2>

                {activeSlots.filter((s) => s.status === "approved").length ===
                0 ? (
                  <p className="text-slate-500 text-sm">
                    No confirmed sessions yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeSlots
                      .filter((s) => s.status === "approved")
                      .map((slot) => (
                        <div
                          key={slot.id || slot._id}
                          className="border border-blue-100 bg-blue-50 rounded-xl p-4"
                        >
                          <p className="font-medium text-slate-800">
                            {slot.date} • {slot.time}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Student:{" "}
                            <span className="font-semibold">
                              {slot.bookedByName || "Student"}
                            </span>
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* REQUESTS */}
              <div className="bg-white rounded-2xl border border-yellow-100 shadow-md p-6">
                <h2 className="text-xl font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Requests
                </h2>

                {activeSlots.filter((s) => s.status === "booked").length ===
                0 ? (
                  <p className="text-slate-500 text-sm">
                    No pending requests.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeSlots
                      .filter((s) => s.status === "booked")
                      .map((slot) => (
                        <div
                          key={slot.id || slot._id}
                          onClick={() => setRejectSlot(slot)}
                          className="cursor-pointer border border-yellow-200 bg-yellow-50 rounded-xl p-4 hover:shadow-md transition"
                        >
                          <p className="font-medium text-slate-800">
                            {slot.date} • {slot.time}
                          </p>
                          <p className="text-sm text-slate-700 mt-1">
                            Requested by{" "}
                            <span className="font-semibold">
                              {slot.bookedByName || "Student"}
                            </span>
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              
            </div>

     {/* RIGHT PANEL */}
                  
    <div className="col-span-1 space-y-8">

  {/* AVAILABLE SLOTS BELOW */}
  <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6 sticky top-8">
    <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
      <Calendar className="h-5 w-5" />
      Your Available Slots
    </h2>

    {activeSlots.filter((s) => s.status === "available").length === 0 ? (
      <p className="text-slate-500 text-sm">
        No available slots.
      </p>
    ) : (
      <div className="space-y-3">
        {activeSlots
          .filter((s) => s.status === "available")
          .map((slot) => (
            <div
              key={slot.id || slot._id}
              className="border border-blue-100 bg-blue-50 rounded-lg p-3 text-sm"
            >
              <p className="font-medium text-slate-800">
                {slot.date}
              </p>
              <p className="text-slate-600">{slot.time}</p>
            </div>
          ))}
      </div>
    )}
  </div>

</div>




          </div>
        )}
      </main>

      {/* ================= STUDENT DETAIL POPUP ================= */}
      {rejectSlot && !showRejectReason && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setRejectSlot(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-700">
                Student Appointment Request
              </h3>
            </div>

            <div className="border border-blue-100 rounded-xl p-5 bg-blue-50 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {rejectSlot.bookedByName?.charAt(0) || "S"}
                </div>
                <div>
                  <button
  onClick={() =>
    navigate(
      `/alumni/student-request/${rejectSlot.id || rejectSlot._id}`,
      { state: { returnToPopup: true } }
    )
  }
  className="font-semibold text-blue-700 text-lg hover:underline"
>
  {rejectSlot.bookedByName || "Student"}
</button>

                  <p className="text-sm text-slate-600">
                    {rejectSlot.date} • {rejectSlot.time}
                  </p>
                </div>
              </div>
            </div>

            {rejectSlot.status === "booked" && (
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() =>
                    handleApprove(rejectSlot.id || rejectSlot._id || "")
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow"
                >
                  Accept Request
                </button>

                <button
                  onClick={() => setShowRejectReason(true)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium shadow"
                >
                  Reject
                </button>
              </div>
            )}

            <button
              onClick={() => setRejectSlot(null)}
              className="mt-6 w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= REJECT REASON POPUP ================= */}
      {rejectSlot && showRejectReason && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setShowRejectReason(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">
                Reject Appointment
              </h3>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full border border-slate-200 rounded-lg p-3 text-sm"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                Confirm Reject
              </button>

              <button
                onClick={() => setShowRejectReason(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {activeMessageOther.studentPhotoUrl ? (
                    <img
                      src={activeMessageOther.studentPhotoUrl}
                      alt={activeMessageOther.studentName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-700 font-bold">
                      {activeMessageOther.studentName?.charAt(0) || "S"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-700">
                    Messages
                  </h3>
                  <p className="text-sm text-slate-600">
                    {activeMessageOther.studentName}
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
                    className={`flex ${m.senderRole === "alumni" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap border ${
                        m.senderRole === "alumni"
                          ? "bg-blue-600 text-white border-blue-600"
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
                placeholder="Write a reply..."
                className="flex-1 min-h-[44px] max-h-[140px] resize-none border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={sendMessageReply}
                disabled={!messageText.trim()}
                className="h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD SLOT POPUP ================= */}
{showAdd && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
    onClick={() => setShowAdd(false)}
  >
    <div
      className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-6">
        <Plus className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-blue-700">
          Add New Slot
        </h3>
      </div>

      <form onSubmit={handleAddSlot} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Select Date
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Select Time
          </label>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Add Slot
          </button>

          <button
            type="button"
            onClick={() => setShowAdd(false)}
            className="flex-1 border py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}