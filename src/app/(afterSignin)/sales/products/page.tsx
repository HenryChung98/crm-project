"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useProducts } from "./hook/useProduct";
import { removeBulkProducts } from "./update/[id]/action";
import { BiCheck } from "react-icons/bi";
//  ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { showSuccess, showError } from "@/utils/feedback";

export default function ProductPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";
  const { confirm, ConfirmModal } = useConfirm();
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // fetch customer infos
  const { data: products, isLoading, error, refetch, isFetching } = useProducts(currentOrgId);

  const handleBulkRemove = async () => {
    if (!products || selectedIndices.length === 0) return;
    const selectedIds = selectedIndices.map((i) => products[i].id);

    confirm(
      async () => {
        setIsDeleteLoading(true);
        try {
          const result = await removeBulkProducts(selectedIds, currentOrgId!);

          if (result.success) {
            showSuccess(`${selectedIds.length} products removed successfully!`);
            refetch();
            setSelectedIndices([]);
          } else {
            showError(`Failed to remove products: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing");
          console.error("Remove products error:", error);
        } finally {
          setIsDeleteLoading(false);
        }
      },
      {
        title: "Remove Products",
        message: `Are you sure you want to remove ${selectedIds.length} product(s)? This action cannot be undone.`,
        confirmText: "Remove",
        variant: "danger",
      }
    );
  };

  const handleSelectionChange = (indices: number[]) => {
    setSelectedIndices(indices);
    // console.log("선택된 행 인덱스:", indices);
    // if (products) {
    //   console.log(
    //     "선택된 데이터:",
    //     indices.map((i) => products[i])
    //   );
    // }
  };

  const data =
    products?.map((product) => [
      product.name,
      product.sku,
      product.description,
      product.type,
      product.price,
      product.cost,
      product.price - product.cost,
      {
        value: product.status,
        textColor: product.status === "active" ? "#22c55e" : "#ef4444",
        icon: <BiCheck />,
      },
      product.note || "",
      <Link key={`update-${product.id}`} href={`/sales/products/update/${product.id}`}>
        <Button>Update</Button>
      </Link>,
    ]) || [];

  if (isLoading) return <FetchingSpinner />;
  if (error) return <QueryErrorUI error={error} onRetry={refetch} />;

  return (
    <>
      <div>product page</div>
      <Button onClick={refetch} disabled={isFetching}>
        {isFetching ? "loading.." : "refresh"}
      </Button>
      <Button
        onClick={handleBulkRemove}
        variant={`${selectedIndices.length === 0 ? "muted" : "danger"}`}
        disabled={selectedIndices.length === 0 || isFetching}
      >
        Delete
      </Button>
      <Table
        headers={[
          "name",
          "SKU",
          "description",
          "type",
          "price",
          "cost",
          "margin",
          "status",
          "note",
        ]}
        data={data}
        searchable={true}
        pagination={true}
        pageSize={20}
        exportable={true}
        columnCount={10}
        selectable={true}
        filterOptions={["TEST", "PROD"]}
        filterColumn={1}
        editable={true}
        editableColumns={[0, 1, 2]} 
        onSelectionChange={handleSelectionChange}
      />

      <Link href={`/sales/products/create?org=${currentOrgId}`}>create</Link>
      <ConfirmModal />
    </>
  );
}
