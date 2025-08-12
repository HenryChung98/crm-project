"use client";
import { useSearchParams } from "next/navigation";
import { useCustomers } from "@/hooks/tanstack/useCustomers";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  // fetch customer infos
  const { data: customers, isLoading, error, refetch, isFetching } = useCustomers(currentOrgId);

  if (isLoading) return <div>Loading customers...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customers {currentOrgId && `(${currentOrgId})`}</h1>
      <button onClick={refetch} className="border rounded p-2 m-2">
        {isFetching ? "loading.." : "refresh"}
      </button>
      <div className="grid gap-4">
        {customers?.map((customer) => (
          <div key={customer.id} className="p-4 border rounded">
            <h3 className="font-semibold">{customer.id}</h3>
            <p className="text-gray-600">{customer.organization_id}</p>
            <p className="text-gray-600">{customer.first_name}</p>
            <p className="text-gray-600">{customer.last_name}</p>
            <p className="text-gray-600">{customer.email}</p>
            <p className="text-gray-600">{customer.status}</p>
            <p className="text-gray-600">{customer.source}</p>
            <p className="text-gray-600">{new Date(customer.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
