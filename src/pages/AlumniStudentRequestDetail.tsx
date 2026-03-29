import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, Slot } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Code,
  Linkedin,
  Github,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AlumniStudentRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [slot, setSlot] = useState<Slot | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadData = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);

      const result = await api.getSlots(user.id);

      // ✅ Declare foundSlot properly here
      const foundSlot =
        result?.appointments?.find(
          (s: Slot) => s.id === id || s._id === id
        ) || null;

      if (!foundSlot) {
        setLoading(false);
        return;
      }

      setSlot(foundSlot);

      if (foundSlot.studentId) {
        try {
          const data = await api.getStudentById(foundSlot.studentId);
          if (data) {
            setStudent(data);
          }
        } catch (err) {
          console.error("Student fetch error:", err);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Load error:", error);
      setLoading(false);
    }
  };

  loadData();
}, [id, user]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <GraduationCap className="w-12 h-12 text-primary mb-4" />
            <div className="text-xl font-medium text-muted-foreground">
                Loading student details...
            </div>
        </div>
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 p-8 bg-card rounded-2xl border border-destructive/20 text-center shadow-lg">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Slot Not Found</h2>
          <p className="text-muted-foreground mb-6">The appointment request you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate(-1)} className="bg-primary text-white px-6 py-2 rounded-lg font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
         <div className="max-w-md mx-auto mt-20 p-8 bg-card rounded-2xl border border-warning/20 text-center shadow-lg">
          <User className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Details Unavailable</h2>
          <p className="text-muted-foreground mb-6">Student details could not be retrieved at this time. Please try again later.</p>
          <button onClick={() => navigate(-1)} className="bg-primary text-white px-6 py-2 rounded-lg font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ================= ACTIONS =================
  const handleApprove = async () => {
    await api.approveBooking(slot.id || slot._id || "");
    navigate(-1);
  };

  const handleReject = async () => {
    await api.rejectBooking(slot.id || slot._id || "", rejectReason);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Navigation & Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 px-4 py-2 bg-accent rounded-full text-accent-foreground border border-primary/20 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide uppercase font-display">New Appointment Request</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: PROFILE & ACADEMIC */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* HERO PROFILE CARD */}
            <div className="bg-card rounded-[2rem] border border-border shadow-2xl shadow-indigo-500/5 p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] -z-0"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative">
                  <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-border">
                    {student?.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-white text-4xl font-display font-bold">
                        {student?.name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-success text-white p-1.5 rounded-lg border-2 border-white shadow-lg">
                    <User className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-center md:text-left space-y-3">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-display">
                    {student?.name}
                  </h1>
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-lg">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    {student?.degree} in {student?.department}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold">
                      CGPA: {student?.cgpa}
                    </span>
                    <span className="px-3 py-1 bg-secondary text-foreground border border-border rounded-lg text-sm font-semibold">
                      Class of {student?.graduationYear}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 font-display">Professional Bio</h3>
                <p className="text-lg leading-relaxed text-foreground/90 italic">
                  "{student?.description || "A dedicated student seeking mentorship and career guidance to excel in the industry."}"
                </p>
              </div>
            </div>

            {/* ACADEMIC & SKILLS GRID */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* SKILLS CARD */}
              <div className="bg-card rounded-3xl border border-border shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent text-primary rounded-xl">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground font-display">Technical Expertise</h3>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {student?.skills?.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-accent text-accent-foreground border border-primary/10 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-widest text-[10px]">Areas of Interest</p>
                  <p className="text-foreground font-medium">
                    {Array.isArray(student?.areaOfInterest) 
                      ? student.areaOfInterest.join(", ") 
                      : student?.areaOfInterest || "Exploring various tech domains"}
                  </p>
                </div>
              </div>

              {/* SOCIAL & ACADEMIC CARD */}
              <div className="bg-card rounded-3xl border border-border shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent text-primary rounded-xl">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground font-display">Academic Background</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">College</span>
                    <span className="text-sm font-bold text-foreground text-right">{student?.college}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Department</span>
                    <span className="text-sm font-bold text-foreground text-right">{student?.department}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    {student?.linkedin && (
                      <a
                        href={student.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white transition-all font-semibold text-sm"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}

                    {student?.github && (
                      <a
                        href={student.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900/5 text-slate-900 hover:bg-slate-900 hover:text-white transition-all font-semibold text-sm"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SESSION & ACTIONS */}
          <div className="space-y-8">
            
            {/* SESSION INFO CARD */}
            <div className="bg-primary rounded-[2rem] p-8 text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute top-4 right-4 opacity-20">
                <Calendar className="w-16 h-16" />
              </div>
              
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2 font-display">
                Session Overview
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Requested Date</p>
                  <p className="text-xl font-bold">{slot?.date}</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">Requested Time</p>
                  <p className="text-xl font-bold">{slot?.time}</p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm font-medium text-white/70">Current Status</span>
                  <span className="capitalize px-3 py-1 bg-white text-primary rounded-full text-xs font-bold">
                    {slot?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* CONTACT CARD */}
            <div className="bg-card rounded-3xl border border-border shadow-xl p-8">
              <h3 className="text-lg font-bold mb-4 font-display">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">Email Address</p>
                    <p className="text-sm font-medium text-foreground">{student?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-foreground">{student?.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS SECTION */}
            {slot?.status === "booked" && (
              <div className="space-y-4">
                <button
                  onClick={handleApprove}
                  className="w-full bg-success hover:bg-success/90 text-white py-5 rounded-2xl font-bold shadow-lg shadow-success/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Request
                </button>

                {!showRejectBox ? (
                  <button
                    onClick={() => setShowRejectBox(true)}
                    className="w-full bg-destructive/10 hover:bg-destructive text-destructive hover:text-white py-5 rounded-2xl font-bold border-2 border-destructive/20 transition-all flex items-center justify-center gap-3"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Reject Appointment
                  </button>
                ) : (
                  <div className="bg-card rounded-3xl border-2 border-destructive/20 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="w-full bg-accent/50 border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-destructive/20 focus:outline-none min-h-[100px]"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleReject}
                        className="flex-1 bg-destructive text-white py-3 rounded-xl font-bold hover:bg-destructive/90 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowRejectBox(false)}
                        className="px-6 border border-border rounded-xl font-bold hover:bg-accent transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}