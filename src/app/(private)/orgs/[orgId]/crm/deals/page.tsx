"use client";
import { useState, useEffect } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { DealForm } from "./_internal/DealForm";
import { useDealsDB } from "./_internal/useDealsDB";
// import { updateContactField, removeBulkContacts } from "./_internal/server/update-actions";

// ui
import { AccessDenied } from "@/components/AccessDenied";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/components/feedback";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";

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

  const handleDropdownChange = async (dealId: string, field: string, value: string) => {
    // Optimistic update
    setLocalDeals((prev) =>
      prev.map((deal) => (deal.id === dealId ? { ...deal, [field]: value } : deal))
    );

    try {
      // const res = await updateDealField(dealId, field, value);
      // if (res?.error) {
      //   showError(`Error: ${res.error}`);
      //   setLocalDeals(deals || []);
      // } else {
      //   showSuccess("Deal updated successfully");
      // }
    } catch (error) {
      showError("An error occurred.");
      setLocalDeals(deals || []);
    }
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
    ]) || [];

  if (isLoading) return <FetchingSpinner />;

  if (!member)
    return (
      <AccessDenied title="Access Denied" message="You don't have permission to access this page" />
    );

  return (
    <>
      <div>deal</div>
      <div className="flex justify-between">
        <Button onClick={refetch} disabled={isFetching}>
          {isFetching ? "refeshing.." : "refresh"}
        </Button>
        <Button onClick={() => setIsFormCollapsed(!isFormCollapsed)}>create</Button>
      </div>
      <Table
        headers={["Name", "Stage", "Closed At", "Created At", "Note"]}
        data={data}
        pageSize={20}
        filterOptions={["instagram Public Lead Form", "By"]}
        filterColumn={2}
        columnCount={6}
        selectedIndices={selectedIndices}
        onSelectionChange={setSelectedIndices}
        isEditable
        editableColumns={[0, 4]}
        // onCellEdit={handleCellEdit}
        isDeletable
        // onBulkRemove={handleBulkRemove}
      />
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
