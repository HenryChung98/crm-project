"use client";

import { useState } from "react";
import { inviteUser } from "./action";
import { useParams } from "next/navigation";

// ui
import { Form } from "../../../../../components/ui/Form";
import { FormField } from "../../../../../components/ui/FormField";
import { Button } from "../../../../../components/ui/Button";
import { showError, showSuccess } from "../../../../../utils/feedback";

export default function InviteMemberForm() {
  const [loading, setLoading] = useState(false);

  const params = useParams<{ orgId: string }>();
  const currentOrgId = params.orgId || "";

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);

    try {
      const res = await inviteUser(formData);
      if (res.success) {
        showSuccess("Invitation sent successfully.");
      } else {
        showError(res.error || "Failed to send invitation.");
      }
    } catch (error) {
      showError("An error occured");
    } finally {
      setLoading(false);
    }
  };

  if (!currentOrgId) {
    return <div className="text-center text-red-600">No organization selected</div>;
  }

  return (
    <>
      <Form action={handleSubmit} formTitle={`Invite user`}>
        <input type="hidden" name="orgId" value={currentOrgId} />
        <FormField label="Email" type="email" name="email" required />

        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Invite"}
        </Button>
      </Form>
    </>
  );
}
