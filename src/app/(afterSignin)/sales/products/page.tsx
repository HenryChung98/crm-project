"use client";
import { useSearchParams } from "next/navigation";

import Link from "next/link";

export default function ProductPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  return (
    <>
      <div>product page</div>
      {currentOrgId}
      <br />
      <Link href="/sales/products/create">create</Link>
    </>
  );
}
