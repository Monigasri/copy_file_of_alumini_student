import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { GraduationCap, Briefcase, User, Loader2 } from "lucide-react";

export default function AlumniRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",

    profession: "",
    company: "",
    previousCompany: "",
    industry: "",
    totalExperience: "",
    yearsInCurrentCompany: "",
    linkedin: "",
    skills: "",

    graduationYear: "",
    degree: "",
    college: "",

    phone: "",
    location: "",
    description: "",
    photoUrl: "",
    meetingMode: "Online",
  });

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setForm(prev => ({
      ...prev,
      photoUrl: reader.result as string,
    }));
  };

  reader.readAsDataURL(file);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (
        !form.name ||
        !form.email ||
        !form.password ||
        !form.profession ||
        !form.company ||
        !form.totalExperience ||
        !form.yearsInCurrentCompany ||
        !form.phone
      ) {
        throw new Error("Please fill in all required fields marked with *");
      }

      const result = await api.registerAlumni({
        ...form,
        totalExperience: Number(form.totalExperience),
        yearsInCurrentCompany: Number(form.yearsInCurrentCompany),
        graduationYear:
          form.graduationYear !== ""
            ? Number(form.graduationYear)
            : undefined,
        skills:
          form.skills?.length > 0
            ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        meetingMode: form.meetingMode as "Online" | "Offline" | "Both",
      });

      if (!result?.ok || !result?.data) {
        throw new Error(result?.error || "Registration failed");
      }

      login(result.data.user, result.data.token);
      navigate("/alumni/home");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Join the Alumni Network
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            Share your journey and mentor the next generation.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* SECTION 1 */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <User className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">
                  Account & Personal
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="name"
                  required
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="phone"
                  required
                  placeholder="Phone *"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email *"
                  value={form.email}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Password *"
                  value={form.password}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="location"
                  placeholder="Location"
                  value={form.location}
                  onChange={handleChange}
                  className="input-style"
                />

                <div className="space-y-3">
  {/* <label className="text-sm font-semibold text-slate-700">
    Profile Photo
  </label> */}

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
</div>

                <textarea
                  name="description"
                  rows={3}
                  placeholder="Short Bio"
                  value={form.description}
                  onChange={handleChange}
                  className="md:col-span-2 input-style"
                />
              </div>
            </div>

            {/* SECTION 2 */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <Briefcase className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">
                  Professional Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="profession"
                  required
                  placeholder="Profession *"
                  value={form.profession}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="company"
                  required
                  placeholder="Current Company *"
                  value={form.company}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="previousCompany"
                  placeholder="Previous Company"
                  value={form.previousCompany}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="totalExperience"
                  type="number"
                  required
                  placeholder="Total Experience *"
                  value={form.totalExperience}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="yearsInCurrentCompany"
                  type="number"
                  required
                  placeholder="Years in Current Company *"
                  value={form.yearsInCurrentCompany}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="linkedin"
                  placeholder="LinkedIn URL"
                  value={form.linkedin}
                  onChange={handleChange}
                  className="md:col-span-2 input-style"
                />

                <input
                  name="skills"
                  placeholder="Skills (Comma separated)"
                  value={form.skills}
                  onChange={handleChange}
                  className="md:col-span-2 input-style"
                />
              </div>
            </div>

            {/* SECTION 3 */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <GraduationCap className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">
                  Education & Preferences
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  name="college"
                  placeholder="College"
                  value={form.college}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="degree"
                  placeholder="Degree"
                  value={form.degree}
                  onChange={handleChange}
                  className="input-style"
                />

                <input
                  name="graduationYear"
                  type="number"
                  placeholder="Graduation Year"
                  value={form.graduationYear}
                  onChange={handleChange}
                  className="input-style"
                />

                <select
                  name="meetingMode"
                  value={form.meetingMode}
                  onChange={handleChange}
                  className="input-style"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Complete Registration"
              )}
            </button>

            <p className="text-center text-sm mt-4 text-slate-600">
              Already have an account?{" "}
              <Link
                to="/alumni/login"
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