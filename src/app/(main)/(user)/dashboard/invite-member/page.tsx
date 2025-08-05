"use client";

import { useState } from "react";
import { inviteUser } from "./action";

export default function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      const res = await inviteUser(formData);
      if (res.success) {
        setSuccessMessage("Invitation sent successfully.");
        setEmail("");
      } else {
        setErrorMessage(res.error || "Failed to send invitation.");
      }
    } catch (error) {
      setErrorMessage("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Invite by email</span>
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 border rounded px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Invite"}
      </button>
      {successMessage && <p className="text-green-600">{successMessage}</p>}
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
    </form>
  );
}
