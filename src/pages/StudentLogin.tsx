import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { GraduationCap, Mail, Lock, ArrowLeft } from "lucide-react";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setError("");
    const result = await api.loginStudent(email, password);

    if (!result.ok) {
      setError(result.error || "Login failed");
      return;
    }
    if (result.data!.user.role !== "student") {
      setError("This account is not a student account");
      return;
    }
    login(result.data!.user, result.data!.token);
    navigate("/student/home");
  };

 const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const result = await api.forgotPassword(email);

    if (!result.ok) {
      setError(result.error || "Failed to send reset link");
      return;
    }

    setResetSent(true);
  } catch (err) {
    console.error(err);
    setError("Something went wrong");
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <button type="button" onClick={() => navigate("/")} className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <GraduationCap className="mx-auto mb-2 h-8 w-8 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              {forgotMode ? "Reset Password" : "Student Login"}
            </h1>
          </div>
          {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {resetSent && <div className="mb-4 rounded-lg bg-success/10 p-3 text-sm text-success">Password reset link sent to your email!</div>}

          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button type="submit" className="rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Send Reset Link</button>
              <button type="button" onClick={() => { setForgotMode(false); setResetSent(false); }} className="text-sm text-primary hover:underline">Back to Login</button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <button type="submit" className="rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Login</button>
              </form>
              <div className="mt-3 text-center">
                <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-primary hover:underline">Forgot Password?</button>
              </div>
              <div className="relative my-4">
                {/* <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div> */}
                {/* <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div> */}
              </div>
              
              {/* <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </button> */}
              
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account? <Link to="/student/register" className="font-medium text-primary hover:underline">Register</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
