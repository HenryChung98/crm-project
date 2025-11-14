"use client";
import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { ContactForm } from "./_internal/ContactForm";
import { useContactsDB } from "./_internal/useContactsDB";

// ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { showSuccess, showError } from "@/components/feedback";
import { Dropdown } from "@/components/ui/Dropdown";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function CRMContactPage() {
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();
  const { currentOrganizationId } = useOrganization();
  const { planData, planLoading } = useSubscription();
  const {
    data: contactData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useContactsDB(currentOrganizationId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [jsonModalData, setJsonModalData] = useState<any>(null);

  const data =
    contactData?.map((contact) => [
      contact.name,
      contact.email,
      contact.source,
      contact.imported_data ? (
        <Button
          key={`view-${contact.id}`}
          variant="secondary"
          onClick={() => setJsonModalData(contact.imported_data)}
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
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
      "bigbig databig databig databig databig databig databig databig data data",
    ]) || [];

  if (isLoading) return <FetchingSpinner />;

  return (
    <>
      <div>contact</div>
      <Button onClick={() => setIsFormCollapsed(!isFormCollapsed)}>create</Button>
      <Button onClick={refetch} disabled={isFetching}>
        {isFetching ? "refeshing.." : "refresh"}
      </Button>
      <Table
        headers={["Name", "Email", "Source", "Imported Data", "Created At", "Status"]}
        data={data}
        searchable
        pagination
        pageSize={20}
        exportable
        filterOptions={["instagram Public Lead Form", "By"]}
        filterColumn={2}
        columnCount={16}
        editable={planData?.plan.name === "premium"}
        editableColumns={[0, 1, 2]} // Name, Email, Source만 수정 가능
        // onCellEdit={handleCellEdit}
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
          setIsFormCollapsed={() => setIsFormCollapsed(true)}
        />
      </div>
      {error && <QueryErrorUI data="contact" error={error} onRetry={refetch} />}
    </>
  );
}
