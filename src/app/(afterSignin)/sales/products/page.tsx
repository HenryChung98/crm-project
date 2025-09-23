"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProducts } from "./hook/useProduct";
//  ui
import { Table } from "@/components/ui/Table";

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
      product.status,
      product.note || "",
    ]) || [];

  return (
    <>
      <div>product page</div>
      <Table headers={headers} data={data} columnCount={9} />
      <Link href="/sales/products/create">create</Link>
    </>
  );
}
