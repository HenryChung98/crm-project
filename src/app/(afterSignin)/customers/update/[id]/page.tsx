"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useCustomers } from "../../hook/useCustomers";
import { updateCustomer } from "./action";
import { useQueryClient } from "@tanstack/react-query";

// ui
import { showSuccess, showError } from "@/utils/feedback";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { CustomerForm, CustomerFormData } from "../../CustomerForm";

export default function UpdateCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";
  
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { confirm, ConfirmModal } = useConfirm();

  const { data: customers, isLoading, error } = useCustomers(currentOrgId);
  const customer = customers?.find((c) => c.id === id);

  const updateCustomerAction = async (data: CustomerFormData) => {
    setButtonLoading(true);
    try {
      const formData = new FormData();
      formData.append("customerId", id);
      formData.append("orgId", data.orgId);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.note) formData.append("note", data.note);

      const res = await updateCustomer(formData);
      if (res?.error) {
        showError(`Error: ${res.error}` || "Failed to update customer");
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["customers"],
        });
        showSuccess("Customer successfully updated");
        router.push(`/customers?org=${currentOrgId}`);
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
        await updateCustomerAction(data);
      },
      {
        title: "Update Customer",
        message: "Are you sure you want to update this customer?",
        confirmText: "Update",
        variant: "primary",
      }
    );
  };

  if (isLoading) return <FetchingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <QueryErrorUI error={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Customer not found</h1>
      </div>
    );
  }

  return (
    <>
      <CustomerForm
        currentOrgId={currentOrgId}
        mode={`update ${customer.first_name}`}
        initialData={{
          orgId: customer.organization_id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          note: customer.note,
        }}
        onSubmit={handleSubmit}
        isLoading={buttonLoading}
      />
      <ConfirmModal />
    </>
  );
}