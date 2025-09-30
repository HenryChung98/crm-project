"use client";
import { useSearchParams } from "next/navigation";
import { useCustomers } from "@/app/(afterSignin)/customers/hook/useCustomers";
import UpdateCustomerStatusButton from "@/components/UpdateCustomerStatusButton";
import Link from "next/link";

// ui
import { Button } from "@/components/ui/Button";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  // fetch customer infos
  const { data: customers, isLoading, error, refetch, isFetching } = useCustomers(currentOrgId);

  if (isLoading) return <FetchingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <QueryErrorUI error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customers {currentOrgId && `(${currentOrgId})`}</h1>
      <Button onClick={refetch} variant="primary">
        {isFetching ? "loading.." : "refresh"}
      </Button>
      <UpdateCustomerStatusButton orgId={currentOrgId} />
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
            <Link href={`/customers/update/${customer.id}`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
