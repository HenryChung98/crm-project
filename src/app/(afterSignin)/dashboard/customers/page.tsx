"use client";
import { useSearchParams } from "next/navigation";
import { useCustomers } from "@/hooks/pages/useCustomers";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  // fetch customer infos
  const { data: customers, isLoading } = useCustomers(currentOrgId);

  if (isLoading) return <div>Loading customers...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Customers {currentOrgId && `(${currentOrgId})`}
      </h1>
      
      <div className="grid gap-4">
        {customers?.map(customer => (
          <div key={customer.id} className="p-4 border rounded">
            <h3 className="font-semibold">{customer.id}</h3>
            <p className="text-gray-600">{customer.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}