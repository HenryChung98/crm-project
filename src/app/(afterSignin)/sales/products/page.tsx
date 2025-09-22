"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

//  ui
import { Table } from "@/components/ui/Table";

export default function ProductPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  const headers = ["ID", "name", "email", "created at", "etc"];
  const data = [
    [1, "김철수", "kim@example.com", "2024-01-15", ""],
    [2, "이영희", "lee@example.com", "2024-01-16"],
  ];

  return (
    <>
      <div>product page</div>
      <Table headers={headers} data={data} columnCount={5} />
      <Link href="/sales/products/create">create</Link>
    </>
  );
}
