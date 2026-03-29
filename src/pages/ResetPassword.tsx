import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3001/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Password updated successfully!");
      const nextRole = data?.role;
      setTimeout(() => {
        if (nextRole === "alumni") navigate("/alumni/login");
        else navigate("/student/login");
      }, 1500);
    } else {
      setMessage(data.message || "Error resetting password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleReset} className="flex flex-col gap-4 p-6 border rounded-xl">
        <h2 className="text-xl font-bold">Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <button className="bg-blue-600 text-white py-2 rounded">
          Update Password
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}