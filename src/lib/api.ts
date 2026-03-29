const BASE_URL = "http://localhost:3001/api";

/* ================= TYPES ================= */

export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "alumni";

  profession?: string;
  company?: string;
  previousCompany?: string;
  industry?: string;
  totalExperience?: number;
  yearsInCurrentCompany?: number;
  linkedin?: string;
  github?: string;
  skills?: string[];
  areaOfInterest?: string[];

  graduationYear?: number;
  degree?: string;
  college?: string;
  department?: string;
  year?: string;
  cgpa?: number;
  course?: string;

  phone?: string;
  location?: string;
  description?: string;
  photoUrl?: string;
  meetingMode?: "Online" | "Offline" | "Both";
  mentorshipDomain?: string;
}

export interface Slot {
  id?: string;
  _id?: string;
  alumniId?: string;
  studentId?: string;
  date: string;
  time: string;
  status: "available" | "booked" | "rejected" | "approved" | "cancelled";
  bookedByName?: string;
  alumniName?: string;
  rejectReason?: string;
}

export interface Message {
  _id?: string;
  id?: string;
  studentId: string;
  alumniId: string;
  senderRole: "student" | "alumni";
  content: string;
  createdAt?: string;
  readStudent?: boolean;
  readAlumni?: boolean;
}

export interface MessageThreadStudent {
  studentId: string;
  studentName: string;
  studentPhotoUrl?: string | null;
  lastMessage: string;
  lastMessageAt?: string;
  lastSenderRole: "student" | "alumni";
  unreadCount: number;
}

export interface MessageThreadAlumni {
  alumniId: string;
  alumniName: string;
  alumniPhotoUrl?: string | null;
  lastMessage: string;
  lastMessageAt?: string;
  lastSenderRole: "student" | "alumni";
  unreadCount: number;
}

/* ================= HELPER ================= */

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  /* ================= STUDENT LOGIN ================= */
  async loginStudent(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/student/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });



    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    localStorage.setItem("token", data.token);
    return { ok: true, data };
  },


  /* ================= forgrt password ================= */
  forgotPassword: async (email: string) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      return { ok: res.ok, ...data };
    } catch (error) {
      return { ok: false, error: "Network error" };
    }
  },
  /* ================= ALUMNI LOGIN ================= */
  async loginAlumni(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/alumni/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    localStorage.setItem("token", data.token);
    return { ok: true, data };
  },

  /* ================= GET STUDENT BY ID ================= */
  async getStudentById(id: string) {
    const res = await fetch(`${BASE_URL}/student/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.student || data;
  },

  /* ================= REGISTER ALUMNI ================= */
  async registerAlumni(userData: Partial<User> & { password?: string }) {
    const res = await fetch(`${BASE_URL}/alumni/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    localStorage.setItem("token", data.token);
    return { ok: true, data };
  },

  /* ================= REGISTER STUDENT ================= */
  async registerStudent(userData: Partial<User> & { password?: string }) {
    const res = await fetch(`${BASE_URL}/student/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    localStorage.setItem("token", data.token);
    return { ok: true, data };
  },

  /* ================= GET HISTORY ================= */
  async getHistory() {
    const res = await fetch(`${BASE_URL}/appointments?history=true`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, appointments: [] };

    return { ok: true, appointments: data.appointments || [] };
  },

  /* ================= GET ALUMNI ================= */
  async getAlumni(search?: string) {
    const query = search ? `?search=${search}` : "";
    const res = await fetch(`${BASE_URL}/alumni${query}`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  async getAlumniById(id: string) {
    const res = await fetch(`${BASE_URL}/alumni/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.alumni || null;
  },

  /* ================= GET SLOTS ================= */
  async getSlots(alumniId: string) {
    const res = await fetch(
      `${BASE_URL}/appointments?alumniId=${alumniId}`,
      { headers: getAuthHeaders() }
    );

    const data = await res.json();
    if (!res.ok) return { appointments: [] };

    return data;
  },

  /* ================= ADD SLOT ================= */
  async addSlot(date: string, time: string) {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ date, time }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    return { ok: true, data };
  },

  async bookSlot(appointmentId: string) {
    const res = await fetch(`${BASE_URL}/appointments/book`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    return { ok: true, data };
  },

  async rejectBooking(appointmentId: string, reason: string) {
    const res = await fetch(`${BASE_URL}/appointments/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId, reason }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    return { ok: true, data };
  },

  async approveBooking(appointmentId: string) {
    const res = await fetch(`${BASE_URL}/appointments/complete`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    return { ok: true, data };
  },

  async cancelSlot(appointmentId: string) {
    const res = await fetch(`${BASE_URL}/appointments/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    return { ok: true, data };
  },

  async cancelBooking(appointmentId: string) {
    return this.cancelSlot(appointmentId);
  },

  /* ================= MESSAGES ================= */
  async sendMessageToAlumni(alumniId: string, content: string) {
    const res = await fetch(`${BASE_URL}/messages/send`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ alumniId, content }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.message || "Failed to send message" };
    return { ok: true, data };
  },

  async sendMessageToStudent(studentId: string, content: string) {
    const res = await fetch(`${BASE_URL}/messages/send`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId, content }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.message || "Failed to send message" };
    return { ok: true, data };
  },

  async getMessageThreads() {
    const res = await fetch(`${BASE_URL}/messages/threads`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.message || "Failed to load threads" };
    return { ok: true, threads: data.threads || [] };
  },

  async getMessageThread(otherId: string) {
    const res = await fetch(`${BASE_URL}/messages/thread/${otherId}`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.message || "Failed to load thread" };
    return { ok: true, other: data.other || null, messages: data.messages || [] };
  },

  async getMessageHistory() {
    const res = await fetch(`${BASE_URL}/messages/history`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.message || "Failed to load message history" };
    return { ok: true, messages: data.messages || [] };
  },

  updateProfile: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      return { ok: false, error: json.message || "Update failed" };
    }

    return {
      ok: true,
      data: json.user,
    };
  },
};