"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/utils/feedback";

export default function EditProfilePage() {
  const { supabase, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.first_name,
    lastName: user?.last_name,
    image: "",
  });

  // handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      });

      if (error) {
        showError(`Failed to update profile: ${error.message}`);
      } else {
        showSuccess("Profile updated successfully!");
      }
    } catch (err) {
      showError(`Failed to update profile: ${err}`);
      console.error("updateProfile error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} formTitle="Edit profile">
      <FormField
        value={formData.firstName}
        type="text"
        name="firstName"
        placeholder="First name"
        onChange={handleChange}
        required
      />
      <FormField
        value={formData.lastName}
        type="text"
        name="lastName"
        placeholder="Last Name"
        onChange={handleChange}
        required
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </Button>
    </Form>
  );
}
