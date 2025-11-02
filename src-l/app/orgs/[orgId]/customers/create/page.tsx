"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createCustomer } from "./action";
import { useQueryClient } from "@tanstack/react-query";

// ui
import { showSuccess, showError } from "../../../../../utils/feedback";
import { useConfirm } from "../../../../../components/ui/ConfirmModal";

import { CustomerForm, CustomerFormData } from "../CustomerForm";

export default function CreateCustomersPage() {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const params = useParams<{ orgId: string }>();
  const currentOrgId = params.orgId || "";
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();

  const createCustomerAction = async (data: CustomerFormData) => {
    setButtonLoading(true);
    try {
      const formData = new FormData();
      formData.append("orgId", data.orgId);
      formData.append("name", data.name);
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
        router.push(`/orgs/${currentOrgId}/customers`);
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
  return (
    <>
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
