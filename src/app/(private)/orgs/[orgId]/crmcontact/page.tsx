"use client";
import { useState, useEffect } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";

import { ContactForm } from "./_internal/ContactForm";
import { useContactsDB } from "./_internal/useContactsDB";
import {
  updateContactStatus,
  updateContactField,
  removeBulkContacts,
} from "./_internal/update-actions";

// ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/components/feedback";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { JsonModal } from "@/components/ui/JsonModal";

export default function CRMContactPage() {
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { confirm, ConfirmModal } = useConfirm();
  const { currentOrganizationId } = useOrganization();
  const { planData, planLoading } = useSubscription();
  const {
    data: contacts,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useContactsDB(currentOrganizationId);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jsonModalData, setJsonModalData] = useState<any>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  const handleViewData = (e: React.MouseEvent<HTMLButtonElement>, data: any) => {
    if (jsonModalData === data) {
      setJsonModalData(null);
      setTriggerElement(null);
    } else {
      setTriggerElement(e.currentTarget);
      setJsonModalData(data);
    }
  };

  // for optimistic update
  const [localCustomers, setLocalCustomers] = useState(contacts || []);
  useState(() => {
    if (contacts) {
      setLocalCustomers(contacts);
    }
  });
  useEffect(() => {
    if (contacts) {
      setLocalCustomers(contacts);
    }
  }, [contacts]);

  // update contact status
  const handleStatusChange = async (customerId: string, targetStatus: string) => {
    confirm(
      async () => {
        try {
          const result = await updateContactStatus(customerId, currentOrganizationId, targetStatus);

          if (result.error || !result.success) {
            showError(result.error || "Failed to update status");
            return;
          }

          showSuccess("Status updated successfully!");
          refetch!();
        } catch (error) {
          showError("Failed to update status");
          console.error("Update status error:", error);
        }
      },
      {
        title: "Change Status",
        message: `Are you sure you want to change status from lead to ${targetStatus}? This action cannot be undone.`,
        confirmText: "Change",
        variant: "primary",
      }
    );
  };

  const handleCellEdit = async (rowIndex: number, columnIndex: number, newValue: string) => {
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
      const result = await updateContactField({
        customerId,
        fieldName,
        newValue,
        orgId: currentOrganizationId,
      });

      if (!result.success) {
        showError(result.error || "Update failed");
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
      console.error("Cell edit error:", error);
    }
  };

  const handleBulkRemove = async () => {
    if (!contacts || selectedIndices.length === 0) return;

    const selectedIds = selectedIndices.map((i) => contacts[i].id);

    confirm(
      async () => {
        try {
          const result = await removeBulkContacts(selectedIds, currentOrganizationId);

          if (result.success) {
            showSuccess(`${selectedIds.length} contacts removed successfully!`);
            refetch!();
            setSelectedIndices([]);
          } else {
            showError(`Failed to remove contacts: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing");
          console.error("Remove contacts error:", error);
        }
      },
      {
        title: "Remove Contacts",
        message: `Are you sure you want to remove ${selectedIds.length} contact(s)? This action cannot be undone.`,
        confirmText: "Remove",
        variant: "danger",
      }
    );
  };

  const data =
    contacts?.map((contact) => [
      contact.name,
      contact.email,
      contact.source,
      contact.imported_data ? (
        <Button
          key={`view-${contact.id}`}
          variant="secondary"
          onClick={(e) => handleViewData(e, contact.imported_data)}
        >
          View Data
        </Button>
      ) : (
        "-"
      ),
      new Date(contact.created_at).toLocaleDateString(),
      {
        value: (
          <Dropdown
            value={contact.status}
            onChange={(e) => handleStatusChange(contact.id, e.target.value)}
          >
            <option value="lead">Lead</option>
            <option value="customer">Customer</option>
            <option value="inactive">Inactive</option>
          </Dropdown>
        ),
        rawValue: contact.status,
      },
      "bigbig databig databig databig databig databig databig databig data data",
    ]) || [];

  if (isLoading) return <FetchingSpinner />;

  return (
    <>
      <div>contact</div>
      <div className="flex justify-between">
        <Button onClick={refetch} disabled={isFetching}>
          {isFetching ? "refeshing.." : "refresh"}
        </Button>
        <Button onClick={() => setIsFormCollapsed(!isFormCollapsed)}>create</Button>
      </div>
      <Table
        headers={["Name", "Email", "Source", "Imported Data", "Created At", "Status"]}
        data={data}
        pageSize={20}
        filterOptions={["instagram Public Lead Form", "By"]}
        filterColumn={2}
        columnCount={10}
        selectedIndices={selectedIndices}
        onSelectionChange={setSelectedIndices}
        isEditable
        editableColumns={[0, 1, 2]} // Name, Email, Source
        onCellEdit={handleCellEdit}
        isDeletable
        onBulkRemove={handleBulkRemove}
      />
      <div
        className={`
          w-130 pt-22 h-screen bg-navbar border-l border-border p-4 fixed right-0 top-0 overflow-y-auto z-40
          transition-transform duration-300 ease-in-out
          ${isFormCollapsed ? "translate-x-full" : "translate-x-0"}
        `}
      >
        <ContactForm
          currentOrgId={currentOrganizationId}
          setFormCollapsed={() => {
            setIsFormCollapsed(true);
          }}
        />
      </div>
      {error && <QueryErrorUI data="contact" error={error} onRetry={refetch} />}
      <ConfirmModal />
      <JsonModal
        data={jsonModalData}
        onClose={() => {
          setJsonModalData(null);
          setTriggerElement(null);
        }}
        triggerElement={triggerElement}
      />
    </>
  );
}
