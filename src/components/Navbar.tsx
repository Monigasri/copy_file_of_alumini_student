import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Clock, GraduationCap, ArrowLeft } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-[1000] flex items-center justify-between border-b border-border bg-card px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        {/* <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button> */}
        <button
          type="button"
          onClick={() => navigate(user?.role === "alumni" ? "/alumni/home" : "/student/home")}
          className="flex items-center gap-2 text-lg font-bold text-primary"
        >
          <GraduationCap className="h-6 w-6" />
          <span className="font-display">AlumConnect</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <User className="h-4 w-4" />
          Profile
        </button>
        <button
          type="button"
          onClick={() => navigate("/history")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Clock className="h-4 w-4" />
          History
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}
