"use client";
import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useActivityLogsDB } from "./_internal/useActivityLogsDB";
import { removeBulkLogs } from "./_internal/server/delete-log";

// ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/components/feedback";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { JsonModal } from "@/components/ui/JsonModal";
import { CRMHeader } from "@/components/CRMHeader";

export default function ActivityLogPage() {
  const { currentOrganizationId } = useOrganization();
  const { data: logs, isLoading, error, refetch } = useActivityLogsDB(currentOrganizationId);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const { confirm, ConfirmModal } = useConfirm();
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

  const data =
    logs?.map((log) => [
      log.entity_type,
      log.action,
      log.changed_data ? (
        <Button
          key={`view-${log.id}`}
          variant="secondary"
          onClick={(e) => handleViewData(e, log.changed_data)}
        >
          View Data
        </Button>
      ) : (
        "-"
      ),
      log.organization_members.user_email,
      new Date(log.created_at).toLocaleString(),
    ]) || [];

  const handleBulkRemove = async () => {
    if (!logs || selectedIndices.length === 0) return;

    const selectedIds = selectedIndices.map((i) => logs[i].id);

    confirm(
      async () => {
        try {
          const result = await removeBulkLogs(selectedIds, currentOrganizationId);

          if (result.success) {
            showSuccess(`${selectedIds.length} logs removed successfully!`);
            refetch!();
            setSelectedIndices([]);
          } else {
            showError(`Failed to remove logs: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing");
          console.error("Remove logs error:", error);
        }
      },
      {
        title: "Remove Logs",
        message: `Are you sure you want to remove ${selectedIds.length} log(s)? This action cannot be undone.`,
        confirmText: "Remove",
        variant: "danger",
      }
    );
  };

  if (isLoading) {
    return <FetchingSpinner />;
  }

  return (
    <>
      <CRMHeader title="Activity Logs" />
      <Table
        headers={["Entity Type", "Action", "Performed By", "Created At"]}
        data={data}
        pageSize={20}
        filterOptions={["contact", "product"]}
        filterColumn={1}
        columnCount={5}
        isEditable={false}
        selectedIndices={selectedIndices}
        onSelectionChange={setSelectedIndices}
        isDeletable
        onBulkRemove={handleBulkRemove}
      />
      {error && <QueryErrorUI data="log" error={error} onRetry={refetch} />}
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
