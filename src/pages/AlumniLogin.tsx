import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { GraduationCap, Mail, Lock, ArrowLeft } from "lucide-react";

export default function AlumniLogin() {
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

    // ✅ FIXED: Use correct API method
    const result = await api.loginAlumni(email, password);

    if (!result.ok) {
      setError(result.error || "Login failed");
      return;
    }

    if (result.data.user.role !== "alumni") {
      setError("This account is not an alumni account");
      return;
    }

    login(result.data.user, result.data.token);
    navigate("/alumni/home");
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <GraduationCap className="mx-auto mb-2 h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {forgotMode ? "Reset Password" : "Alumni Login"}
            </h1>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {resetSent && (
            <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-600">
              Password reset link sent!
            </div>
          )}

          {forgotMode ? (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-primary py-2.5 text-sm font-medium text-white"
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setResetSent(false);
                }}
                className="text-sm text-primary hover:underline"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-primary py-2.5 text-sm font-medium text-white"
                >
                  Login
                </button>
              </form>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/alumni/register"
                  className="font-medium text-primary hover:underline"
                >
                  Register
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}