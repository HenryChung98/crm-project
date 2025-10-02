"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProducts } from "./hook/useProduct";
//  ui
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";

export default function ProductPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  // fetch customer infos
  const { data: products, isLoading, error, refetch, isFetching } = useProducts(currentOrgId);

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
      <Link href={`/sales/products/update/${product.id}`}>
        <Button>Update</Button>
      </Link>,
      <Link href={`/sales/products/update/${product.id}`}>
        <Button variant="danger">Delete</Button>
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
      <Table headers={headers} data={data} columnCount={12} />
      <Link href="/sales/products/create">create</Link>
    </>
  );
}
