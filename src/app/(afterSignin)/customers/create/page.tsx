"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createCustomer } from "./action";
import { useQueryClient } from "@tanstack/react-query";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/utils/feedback";
import { useConfirm } from "@/components/ui/ConfirmModal";

import { CustomerForm } from "../CustomerForm";

interface CustomerFormData {
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  note?: string | null;
}

export default function CreateCustomersPage() {
  const [formData, setFormData] = useState<CustomerFormData>({
    orgId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    note: "",
  });

  // =============================for form=============================
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";
  const { confirm, ConfirmModal } = useConfirm();

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  // const createCustomerAction = async (formData: FormData) => {
  //   setButtonLoading(true);
  //   try {
  //     const res = await createCustomer(formData);
  //     if (res?.error) {
  //       showError(`Error: ${res.error}` || "Failed to add customer");
  //     } else {
  //       await queryClient.invalidateQueries({
  //         queryKey: ["customers"],
  //       });

  //       showSuccess("Customer successfully created");
  //     }
  //   } catch (error) {
  //     showError("An error occurred.");
  //   } finally {
  //     setButtonLoading(false);
  //   }
  // };

  // const handleSubmit = async (formData: FormData) => {
  //   confirm(
  //     async () => {
  //       await createCustomerAction(formData);
  //     },
  //     {
  //       title: "Create Customer",
  //       message: "Are you sure you want to create this customer?",
  //       confirmText: "Create",
  //       variant: "primary",
  //     }
  //   );
  // };
  const createCustomerAction = async (data: CustomerFormData) => {
    setButtonLoading(true);
    try {
      const formData = new FormData();
      formData.append("orgId", data.orgId);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.note) formData.append("note", data.note);

      const res = await createCustomer(formData);
      if (res?.error) {
        showError(`Error: ${res.error}` || "Failed to add customer");
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["customers"],
        });
        showSuccess("Customer successfully created");
      }
    } catch (error) {
      showError("An error occurred.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleSubmit = async (data: CustomerFormData) => {
    confirm(
      async () => {
        await createCustomerAction(data);
      },
      {
        title: "Create Customer",
        message: "Are you sure you want to create this customer?",
        confirmText: "Create",
        variant: "primary",
      }
    );
  };
  // =============================/for form=============================
  return (
    <>
      {/* <Form action={handleSubmit} formTitle={`add customer`}>
        <input type="hidden" name="orgId" value={currentOrgId} />
        <FormField
          label="First Name"
          name="firstName"
          type="text"
          placeholder="John"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <FormField
          label="Last Name"
          name="lastName"
          type="text"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder="example@example.com"
          value={formData.email}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <FormField
          label="Phone"
          name="phone"
          type="text"
          placeholder="1234567890"
          value={formData.phone ?? ""}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <FormField
          label="Note"
          name="note"
          type="text"
          placeholder="Any Note"
          value={formData.note ?? ""}
          onChange={handleChange}
          className="border w-full p-2"
        />
        <Button type="submit" disabled={buttonLoading}>
          {buttonLoading ? "Adding..." : "Add customer"}
        </Button>
      </Form> */}
      <CustomerForm
        currentOrgId={currentOrgId}
        mode="create"
        onSubmit={handleSubmit}
        isLoading={buttonLoading}
      />
      <ConfirmModal />
    </>
  );
}
