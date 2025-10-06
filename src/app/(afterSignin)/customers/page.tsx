"use client";
import { useSearchParams } from "next/navigation";
import { useCustomers } from "@/app/(afterSignin)/customers/hook/useCustomers";
import Link from "next/link";
import { removeCustomer } from "./update/[id]/action";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";

// ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { showSuccess, showError } from "@/utils/feedback";
import { useConfirm } from "@/components/ui/ConfirmModal";

//
export default function CustomersPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";
  const { confirm, ConfirmModal } = useConfirm();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // fetch customer infos
  const { data: customers, isLoading, error, refetch, isFetching } = useCustomers(currentOrgId);

  if (isLoading) return <FetchingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <QueryErrorUI error={error} onRetry={refetch} />
      </div>
    );
  }

  const handleRemove = async (customer: string) => {
    confirm(
      async () => {
        setIsDeleteLoading(true);
        try {
          const result = await removeCustomer(customer, currentOrgId!);

          if (result.success) {
            showSuccess("Member removed successfully!");
            refetch();
          } else {
            showError(`Failed to remove member: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing");
          console.error("Remove member error:", error);
        } finally {
          setIsDeleteLoading(false);
        }
      },
      {
        title: "Remove Member",
        message: "Are you sure you want to remove this member? This action cannot be undone.",
        confirmText: "Remove",
        variant: "danger",
      }
    );
  };

  const headers = ["Name", "Email", "Source", "Created At"];
  const data =
    customers?.map((customer) => [
      customer.name,
      customer.email,
      customer.source,
      new Date(customer.created_at).toLocaleString(),
      <Link key={`update-${customer.id}`} href={`/customers/update/${customer.id}`}>
        <Button variant="secondary">Update</Button>
      </Link>,
      <Button
        key={`delete-${customer.id}`}
        variant="danger"
        disabled={isDeleteLoading}
        onClick={() => handleRemove(customer.id)}
      >
        {isDeleteLoading ? "Deleting..." : "Delete"}
      </Button>,
    ]) || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <Button onClick={refetch} variant="primary">
        {isFetching ? "loading.." : "refresh"}
      </Button>
      <CopyButton
        text={`${window.location.origin}/public/booking?org=${currentOrgId}`}
        label="Copy"
      />
      <Table headers={headers} data={data} columnCount={6} />
      <ConfirmModal />
    </div>
  );
}
