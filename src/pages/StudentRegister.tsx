import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { GraduationCap, User, BookOpen, Code, Loader2 } from "lucide-react";

export default function StudentRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    degree: "",
    department: "",
    year: "",
    cgpa: "",
    graduationYear: "",
    skills: "",
    areaOfInterest: "",
    linkedin: "",
    github: "",
    description: "",
    mentorshipDomain: "",
    meetingMode: "Online",
    location: "",
    photoUrl: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  /* ================= INPUT CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= FILE UPLOAD ================= */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        photoUrl: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (
        !form.name ||
        !form.email ||
        !form.password ||
        !form.phone ||
        !form.college ||
        !form.degree
      ) {
        throw new Error("Please fill in all required fields marked with *");
      }

      const result = await api.registerStudent({
        ...form,
        cgpa: Number(form.cgpa),
        graduationYear: Number(form.graduationYear),
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        areaOfInterest: form.areaOfInterest.split(",").map(s => s.trim()).filter(Boolean),
        meetingMode: form.meetingMode as "Online" | "Offline" | "Both",
      });

      if (!result.ok) {
        throw new Error(result.error || "Registration failed");
      }

      login(result.data.user, result.data.token);
      navigate("/student/home");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Student Registration
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            Join the community to connect with alumni mentors.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* SECTION 1: PERSONAL */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <User className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">
                  Account & Personal
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                  <input name="name" required value={form.name} onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Password *</label>
                  <input name="password" type="password" required value={form.password} onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
                  <input name="phone" required value={form.phone} onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Location</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>

                {/* PHOTO UPLOAD */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Profile Photo</label>

                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-slate-800 transition text-sm">
                      Choose Image
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>

                    {form.photoUrl && (
                      <img src={form.photoUrl} alt="Preview"
                        className="h-16 w-16 rounded-full object-cover border shadow" />
                    )}
                  </div>

                  <input
                    name="photoUrl"
                    placeholder="Or paste image URL here..."
                    value={form.photoUrl}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Short Bio / Career Goal</label>
                  <textarea name="description" rows={2} value={form.description} onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>

              </div>
            </div>

            {/* SECTION 2: ACADEMIC */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <GraduationCap className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">Academic Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="college" required placeholder="College *"
                  value={form.college} onChange={handleChange}
                  className="input" />
                <input name="degree" required placeholder="Degree *"
                  value={form.degree} onChange={handleChange}
                  className="input" />
                <input name="department" placeholder="Department"
                  value={form.department} onChange={handleChange}
                  className="input" />
                <input name="cgpa" type="number" placeholder="CGPA"
                  value={form.cgpa} onChange={handleChange}
                  className="input" />
                <input name="graduationYear" type="number" placeholder="Graduation Year"
                  value={form.graduationYear} onChange={handleChange}
                  className="input" />
              </div>
            </div>

            {/* SECTION 3: SKILLS */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <Code className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">Skills & Preferences</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="skills" placeholder="Skills (comma separated)"
                  value={form.skills} onChange={handleChange}
                  className="input" />
                <input name="areaOfInterest" placeholder="Areas of Interest"
                  value={form.areaOfInterest} onChange={handleChange}
                  className="input" />
                <input name="linkedin" placeholder="LinkedIn URL"
                  value={form.linkedin} onChange={handleChange}
                  className="input" />
                <input name="github" placeholder="GitHub URL"
                  value={form.github} onChange={handleChange}
                  className="input" />
              </div>
            </div>

            <button type="submit"
              className="w-full bg-primary text-white py-3 rounded-xl font-bold">
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Complete Registration"}
            </button>

            <p className="text-center text-sm mt-4 text-slate-600">
              Already have an account?{" "}
              <Link
                to="/student/login"
                className="text-primary font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}