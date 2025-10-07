"use client";
import { useSearchParams } from "next/navigation";
import { useCustomers } from "@/app/(afterSignin)/customers/hook/useCustomers";
import Link from "next/link";
import { removeCustomer } from "./update/[id]/action";
import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { updateCustomerStatus } from "./hook/customers";

// ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
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

  // ========== JSON Modal State ==========
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jsonModalData, setJsonModalData] = useState<any>(null);
  // ======================================

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

  const handleStatusChange = async (customerId: string) => {
    confirm(
      async () => {
        try {
          await updateCustomerStatus(customerId, currentOrgId);

          showSuccess("Status updated successfully!");
          refetch();
        } catch (error) {
          showError("Failed to update status");
          console.error("Update status error:", error);
        }
      },
      {
        title: "Change Status",
        message: `Are you sure you want to change status from lead to customer? This action cannot be undone.`,
        confirmText: "Change",
        variant: "primary",
      }
    );
  };

  const headers = ["Name", "Email", "Source", "Imported Data", "Created At", "Status"];

  const data =
    customers?.map((customer) => [
      customer.name,
      customer.email,
      customer.source,
      // ========== View JSON Data Button ==========
      <Button
        key={`view-${customer.id}`}
        variant="secondary"
        onClick={() => setJsonModalData(customer.imported_data)}
      >
        View Data
      </Button>,
      // ===========================================
      new Date(customer.created_at).toLocaleDateString(),
      {
        value:
          customer.status === "customer" ? (
            customer.status
          ) : (
            <Button variant="accent" onClick={() => handleStatusChange(customer.id)}>
              Lead
            </Button>
          ),
        textColor: customer.status === "customer" ? "#60a5fa" : "#22c55e",
      },
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
        text={`${window.location.origin}/public/booking?org=${currentOrgId}&src=instagram`}
        label="Copy"
      />
      <Table headers={headers} data={data} columnCount={8} />

      <ConfirmModal />

      {/* ========== JSON Data Modal ========= */}
      {jsonModalData && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          onClick={() => setJsonModalData(null)}
        >
          <div
            className="p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-auto bg-indigo-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Imported Data</h3>
              <Button variant="secondary" onClick={() => setJsonModalData(null)}>
                Close
              </Button>
            </div>
            <pre className="text-sm p-4 bg-indigo-800 rounded overflow-auto z-50">
              {JSON.stringify(jsonModalData, null, 2)}
            </pre>
          </div>
        </div>
      )}
      {/* ===================================== */}
    </div>
  );
}
