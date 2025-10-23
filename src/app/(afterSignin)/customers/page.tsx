// CustomersPage.tsx (수정된 버전)
"use client";
import { useSearchParams } from "next/navigation";
import { useCustomers } from "@/app/(afterSignin)/customers/hook/useCustomers";
import Link from "next/link";
import { removeCustomer } from "./update/[id]/action";
import { useState, useEffect } from "react";
import { updateCustomerStatus } from "./hook/customers";
// ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { showSuccess, showError } from "@/utils/feedback";
import { useConfirm } from "@/components/ui/ConfirmModal";

import { usePlanByOrg } from "@/hooks/tanstack/usePlan";

// ===== 추가: 인라인 수정을 위한 API 함수 =====
import { updateCustomerField } from "./hook/customers"; // 이 함수는 아래에 구현 예시 제공
// ============================================


export default function CustomersPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";
  const { confirm, ConfirmModal } = useConfirm();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { data: orgPlan, isLoading: orgPlanLoading } = usePlanByOrg(currentOrgId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jsonModalData, setJsonModalData] = useState<any>(null);

  const {
    data: customers,
    isLoading: isCustomerLoading,
    error,
    refetch,
    isFetching,
  } = useCustomers(currentOrgId);

  // ===== 추가: 로컬 상태로 customers 데이터 관리 (Optimistic Update용) =====
  const [localCustomers, setLocalCustomers] = useState(customers || []);

  // customers 데이터가 변경되면 로컬 상태도 업데이트
  useState(() => {
    if (customers) {
      setLocalCustomers(customers);
    }
  });
  useEffect(() => {
    if (customers) {
      setLocalCustomers(customers);
    }
  }, [customers]);
  // =========================================================================

  if (isCustomerLoading || orgPlanLoading) return <FetchingSpinner />;

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
          const result = await updateCustomerStatus(customerId, currentOrgId);

          if (result.error || !result.success) {
            showError(result.error || "Failed to update status");
            return;
          }

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

  // ===== 추가: 인라인 수정 핸들러 (Optimistic Update) =====
  const handleCellEdit = async (
    rowIndex: number,
    columnIndex: number,
    newValue: string,
  ) => {
    // 컬럼 매핑: 0=name, 1=email
    const columnMap: { [key: number]: string } = {
      0: "name",
      1: "email",
    };

    const fieldName = columnMap[columnIndex];
    if (!fieldName) return;

    const customer = localCustomers[rowIndex];
    const customerId = customer.id;
    const previousValue = customer[fieldName as keyof typeof customer];

    // 1. Optimistic Update: UI 먼저 업데이트
    setLocalCustomers((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [fieldName]: newValue,
      };
      return updated;
    });

    try {
      // 2. Server Action 호출
      const result = await updateCustomerField({
        customerId,
        fieldName,
        newValue,
        orgId: currentOrgId,
      });

      if (!result.success) {
        throw new Error(result.error || "Update failed");
      }

      showSuccess(`${fieldName} updated successfully!`);
    } catch (error) {
      // 3. 실패시 롤백
      setLocalCustomers((prev) => {
        const rollback = [...prev];
        rollback[rowIndex] = {
          ...rollback[rowIndex],
          [fieldName]: previousValue,
        };
        return rollback;
      });

      showError(`Failed to update ${fieldName}`);
      console.error("Cell edit error:", error);
    }
  };
  // =========================================================

  const data =
    localCustomers?.map((customer) => [
      customer.name,
      customer.email,
      customer.source,
      customer.imported_data ? (
        <Button
          key={`view-${customer.id}`}
          variant="secondary"
          onClick={() => setJsonModalData(customer.imported_data)}
        >
          View Data
        </Button>
      ) : (
        "-"
      ),
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
      {/* ===== 수정: editable, editableColumns, onCellEdit 추가 ===== */}
      <Table
        headers={["Name", "Email", "Source", "Imported Data", "Created At", "Status"]}
        data={data}
        searchable={true}
        pagination={true}
        pageSize={20}
        exportable={true}
        filterOptions={["instagram Public Lead Form", "By"]}
        filterColumn={2}
        columnCount={7}
        editable={true}
        editableColumns={[0, 1, 2]} // Name, Email, Source만 수정 가능
        onCellEdit={handleCellEdit}
      />
      {/* ========================================================== */}
      {/* <Table
        headers={["Name", "Email", "Source", "Imported Data", "Created At", "Status"]}
        data={data}
        searchable={true}
        pagination={true}
        pageSize={20}
        exportable={true}
        filterOptions={["instagram Public Lead Form", "By"]}
        filterColumn={2}
        columnCount={8}
      /> */}

      <ConfirmModal />

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
    </div>
  );
}
