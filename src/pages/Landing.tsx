import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-10 text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <GraduationCap className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">AlumConnect</h1>
        <p className="mt-3 text-lg text-muted-foreground">Connect with alumni. Book appointments. Build your future.</p>
      </div>

      <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
        <div className="animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Users className="mb-3 h-8 w-8 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">I'm a Student</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">Find alumni mentors and book appointments</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate("/student/login")}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Login <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/student/register")}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Register
            </button>
          </div>
        </div>

        <div className="animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-sm" style={{ animationDelay: "0.1s" }}>
          <GraduationCap className="mb-3 h-8 w-8 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">I'm an Alumni</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">Offer mentorship and manage appointments</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate("/alumni/login")}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Login <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/alumni/register")}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
