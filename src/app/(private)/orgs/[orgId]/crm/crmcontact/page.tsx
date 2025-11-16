"use client";
import { useState, useEffect } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";

import { ContactForm } from "./_internal/ContactForm";
import { useContactsDB } from "./_internal/useContactsDB";
import { updateContactField, removeBulkContacts } from "./_internal/server/update-actions";

// ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/components/feedback";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { JsonModal } from "@/components/ui/JsonModal";

export default function CRMContactPage() {
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);

  const { confirm, ConfirmModal } = useConfirm();
  const { currentOrganizationId } = useOrganization();
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [localContacts, setLocalContacts] = useState<any[]>([]);
  useEffect(() => {
    if (contacts) {
      setLocalContacts(contacts);
    }
  }, [contacts]);

  const handleDropdownChange = async (contactId: string, fieldName: string, newValue: string) => {
    confirm(
      async () => {
        try {
          const result = await updateContactField({
            customerId: contactId,
            fieldName,
            newValue,
            orgId: currentOrganizationId,
          });

          if (result.success) {
            showSuccess(`${fieldName} updated successfully!`);
            refetch!();
          } else {
            showError(result.error || `Failed to update ${fieldName}`);
          }
        } catch (error) {
          showError(`Failed to update ${fieldName}`);
          console.error("Update dropdown error:", error);
        }
      },
      {
        title: `Change ${fieldName}`,
        message: `Are you sure you want to change ${fieldName} to ${newValue}? This action cannot be undone.`,
        confirmText: "Change",
        variant: "primary",
      }
    );
  };

  const handleCellEdit = async (rowIndex: number, columnIndex: number, newValue: string) => {
    const columnMap: { [key: number]: string } = {
      0: "name",
      1: "email",
      5: "status",
    };

    const fieldName = columnMap[columnIndex];
    if (!fieldName) return;

    const contact = localContacts[rowIndex];
    const contactId = contact.id;
    const previousValue = contact[fieldName as keyof typeof contact];

    // 1. Optimistic Update
    setLocalContacts((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [fieldName]: newValue,
      };
      return updated;
    });

    try {
      // 2. Server Action
      const result = await updateContactField({
        customerId: contactId,
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
      // 3. Rollback
      setLocalContacts((prev) => {
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
    if (!localContacts || selectedIndices.length === 0) return;

    const selectedIds = selectedIndices.map((i) => localContacts[i].id);

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
    localContacts?.map((contact) => [
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
            onChange={(e) => handleDropdownChange(contact.id, "status", e.target.value)}
          >
            <option value="lead">Lead</option>
            <option value="customer">Customer</option>
            <option value="inactive">Inactive</option>
          </Dropdown>
        ),
        rawValue: contact.status,
      },
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
        columnCount={6}
        selectedIndices={selectedIndices}
        onSelectionChange={setSelectedIndices}
        isEditable
        editableColumns={[0, 1]} // Name, Email, Source
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
