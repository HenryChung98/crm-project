"use client";

import Link from "next/link";

// ui
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

// 7-day grace period provided after,
// 30-day readonly after,
// delete
// when readonly, enable delete / disable update insert create

export default function BillingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <PageHeader title="Billing" />
      <Link href="/subscription">change plan</Link>
      <div className="space-y-4 mt-8">
        <Button className="bg-green-600 hover:bg-green-700">Subscribe (Active)</Button>

        <Button className="bg-red-600 hover:bg-red-700">Unsubscribe (Cancelled)</Button>

        <Button className="bg-gray-600 hover:bg-gray-700">Make Expired</Button>
      </div>
    </div>
  );
}
