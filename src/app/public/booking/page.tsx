"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/utils/feedback";

export default function BookingFormPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";
  const currentSource = searchParams.get("src") || "";
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const note = formData.get("note")?.toString() || "";

    try {
      const response = await fetch("/api/public/lead-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentOrgId,
          source: currentSource,
          name,
          email,
          phone,
          note,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit");
      }

      showSuccess("Your request has been submitted successfully.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Form action={handleSubmit} formTitle="Booking Form">
        {/* Honeypot field for preventing spam */}
        <input
          type="text"
          name="website"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />
        <FormField label="Name" name="name" type="text" placeholder="John" required />

        <FormField label="Email" name="email" type="email" placeholder="example@gmail.com" />

        <FormField label="Phone" name="phone" type="tel" placeholder="1234567890" />

        <FormField label="Message" name="note" type="textarea" placeholder="any question" />

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </Form>
    </div>
  );
}
