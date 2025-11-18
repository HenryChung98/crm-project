"use client";
import { useState, useEffect } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { DealForm } from "./_internal/DealForm";
import { useDealsDB } from "./_internal/useDealsDB";
import { updateDealField, removeBulkDeals } from "./_internal/server/update-actions";

// ui
import { AccessDenied } from "@/components/pages/AccessDenied";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/components/feedback";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/pages/QueryErrorUI";
import { CRMHeader } from "@/components/pages/CRMHeader";
import { EmptyState } from "@/components/pages/EmptyState";

export default function DealPage() {
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);

  const { confirm, ConfirmModal } = useConfirm();
  const { currentOrganizationId, member } = useOrganization();
  const { data: deals, isLoading, error, refetch, isFetching } = useDealsDB(currentOrganizationId);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // for optimistic update
  const [localDeals, setLocalDeals] = useState(deals || []);
  useEffect(() => {
    if (deals) {
      setLocalDeals(deals);
    }
  }, [deals]);

  const handleDropdownChange = async (dealId: string, fieldName: string, newValue: string) => {
    const deal = localDeals.find((d) => d.id === dealId);
    const previousValue = deal?.[fieldName as keyof typeof deal];

    confirm(
      async () => {
        try {
          const result = await updateDealField({
            dealId: dealId,
            fieldName,
            newValue,
            oldValue: previousValue as string,
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
        message: `Are you sure you want to change ${fieldName} from "${previousValue}" to "${newValue}"? This action cannot be undone.`,
        confirmText: "Change",
        variant: "primary",
      }
    );
  };

  const handleCellEdit = async (rowIndex: number, columnIndex: number, newValue: string) => {
    const columnMap: { [key: number]: string } = {
      0: "name",
      1: "stage",
      4: "note",
    };

    const fieldName = columnMap[columnIndex];
    if (!fieldName) return;

    const deal = localDeals[rowIndex];
    const dealId = deal.id;
    const previousValue = deal[fieldName as keyof typeof deal];

    // 1. Optimistic Update
    setLocalDeals((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        [fieldName]: newValue,
      };
      return updated;
    });

    try {
      // 2. Server Action
      const result = await updateDealField({
        dealId: dealId,
        fieldName,
        newValue,
        oldValue: previousValue as string,
        orgId: currentOrganizationId,
      });

      if (!result.success) {
        showError(result.error || "Update failed");
        throw new Error(result.error || "Update failed");
      }

      showSuccess(`${fieldName} updated successfully!`);
    } catch (error) {
      // 3. Rollback
      setLocalDeals((prev) => {
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
    if (!localDeals || selectedIndices.length === 0) return;

    const selectedIds = selectedIndices.map((i) => localDeals[i].id);

    confirm(
      async () => {
        try {
          const result = await removeBulkDeals(selectedIds, currentOrganizationId);

          if (result.success) {
            showSuccess(`${selectedIds.length} deals removed successfully!`);
            refetch!();
            setSelectedIndices([]);
          } else {
            showError(`Failed to remove deals: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing");
          console.error("Remove deals error:", error);
        }
      },
      {
        title: "Remove Deals",
        message: `Are you sure you want to remove ${selectedIds.length} deal(s)? This action cannot be undone.`,
        confirmText: "Remove",
        variant: "danger",
      }
    );
  };

  const data =
    localDeals?.map((deal) => [
      deal.name,
      {
        value: (
          <Dropdown
            value={deal.stage}
            onChange={(e) => handleDropdownChange(deal.id, "stage", e.target.value)}
          >
            <option value="lead">Lead</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed-won">Closed Won</option>
            <option value="closed-lost">Closed Lost</option>
          </Dropdown>
        ),
        rawValue: deal.stage,
      },
      new Date(deal.closed_at).toLocaleDateString(),
      new Date(deal.created_at).toLocaleDateString(),
      deal.note,
      deal.contact.name,
      deal.product.name,
    ]) || [];

  if (isLoading) return <FetchingSpinner />;

  if (!member)
    return (
      <AccessDenied title="Access Denied" message="You don't have permission to access this page" />
    );

  return (
    <>
      <CRMHeader
        title="Deal"
        actions={
          <>
            <Button onClick={refetch} disabled={isFetching}>
              {isFetching ? "refeshing.." : "refresh"}
            </Button>
            <Button onClick={() => setIsFormCollapsed(!isFormCollapsed)}>create</Button>
          </>
        }
      />
      {localDeals && localDeals.length > 0 ? (
        <Table
          headers={["Name", "Stage", "Closed At", "Created At", "Note", "Contact", "Product"]}
          data={data}
          pageSize={20}
          filterOptions={[
            "Lead",
            "Qualified",
            "Proposal",
            "Negotiation",
            "Closed Won",
            "Closed Lost",
          ]}
          filterColumn={2}
          columnCount={7}
          selectedIndices={selectedIndices}
          onSelectionChange={setSelectedIndices}
          isEditable
          editableColumns={[0, 4]}
          onCellEdit={handleCellEdit}
          isDeletable
          onBulkRemove={handleBulkRemove}
        />
      ) : (
        <EmptyState title="deals" />
      )}

      <div
        className={`
        w-130 pt-22 h-screen bg-navbar border-l border-border p-4 fixed right-0 top-0 overflow-y-auto z-40
        transition-transform duration-300 ease-in-out
        ${isFormCollapsed ? "translate-x-full" : "translate-x-0"}
      `}
      >
        <DealForm
          currentOrgId={currentOrganizationId}
          userId={member.id}
          setFormCollapsed={() => {
            setIsFormCollapsed(true);
          }}
        />
      </div>
      {error && <QueryErrorUI data="deal" error={error} onRetry={refetch} />}
      <ConfirmModal />
    </>
  );
}
