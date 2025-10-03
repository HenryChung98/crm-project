"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useProducts } from "./hook/useProduct";
import { removeProduct } from "./update/[id]/action";

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

  // fetch customer infos
  const { data: products, isLoading, error, refetch, isFetching } = useProducts(currentOrgId);

  const handleRemove = async (customer: string) => {
    confirm(
      async () => {
        setIsDeleteLoading(true);
        try {
          const result = await removeProduct(customer, currentOrgId!);

          if (result.success) {
            showSuccess("Product removed successfully!");
            refetch();
          } else {
            showError(`Failed to remove product: ${result.error}`);
          }
        } catch (error) {
          showError("An error occurred while removing");
          console.error("Remove product error:", error);
        } finally {
          setIsDeleteLoading(false);
        }
      },
      {
        title: "Remove Product",
        message: "Are you sure you want to remove this product? This action cannot be undone.",
        confirmText: "Remove",
        variant: "danger",
      }
    );
  };

  const headers = [
    "ID",
    "name",
    "SKU",
    "description",
    "type",
    "price",
    "cost",
    "margin",
    "status",
    "note",
  ];
  const data =
    products?.map((product) => [
      product.id,
      product.name,
      product.sku,
      product.description,
      product.type,
      product.price,
      product.cost,
      product.price - product.cost,
      product.status,
      product.note || "",
      <Link key={`update-${product.id}`} href={`/sales/products/update/${product.id}`}>
        <Button>Update</Button>
      </Link>,
      <Button
        key={`delete-${product.id}`}
        variant="danger"
        disabled={isDeleteLoading}
        onClick={() => handleRemove(product.id)}
      >
        {isDeleteLoading ? "Deleting..." : "Delete"}
      </Button>,
    ]) || [];

  if (isLoading) return <FetchingSpinner />;
  if (error) return <QueryErrorUI error={error} onRetry={refetch} />;

  return (
    <>
      <div>product page</div>
      <Button onClick={refetch} disabled={isFetching}>
        {isFetching ? "loading.." : "refresh"}
      </Button>
      <Table headers={headers} data={data} columnCount={12} />
      <Link href={`/sales/products/create?org=${currentOrgId}`}>create</Link>
      <ConfirmModal />
    </>
  );
}
