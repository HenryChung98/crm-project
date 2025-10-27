"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useProducts } from "../../hook/useProduct";
import { updateProduct } from "./action";
import { useQueryClient } from "@tanstack/react-query";

// ui
import { showSuccess, showError } from "@/utils/feedback";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
import { ProductForm, ProductFormData } from "../../ProductForm";

export default function UpdateCustomerPage() {
  const params = useParams<{ id: string; orgId: string }>();
  const currentOrgId = params.orgId || "";
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { confirm, ConfirmModal } = useConfirm();

  const { data: products, isLoading, error } = useProducts(currentOrgId);
  const product = products?.find((c) => c.id === params.id);

  const updateProductAction = async (data: ProductFormData) => {
    setButtonLoading(true);
    try {
      const formData = new FormData();
      formData.append("orgId", data.orgId);
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      formData.append("description", data.description);
      formData.append("type", data.type);
      formData.append("price", data.price?.toString() || "0");
      formData.append("cost", data.cost?.toString() || "0");
      if (data.note) formData.append("note", data.note);

      const res = await updateProduct(product!.id, formData);
      if (res?.error) {
        showError(`Error: ${res.error}` || "Failed to update product");
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["products"],
        });
        showSuccess("Product successfully updated");
        router.push(`/orgs/${currentOrgId}/sales/products`);
      }
    } catch (error) {
      showError("An error occurred.");
    } finally {
      setButtonLoading(false);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    confirm(
      async () => {
        await updateProductAction(data);
      },
      {
        title: "Update Product",
        message: "Are you sure you want to update this product?",
        confirmText: "Update",
        variant: "primary",
      }
    );
  };

  if (isLoading) return <FetchingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <QueryErrorUI error={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Customer not found</h1>
      </div>
    );
  }

  return (
    <>
      <ProductForm
        currentOrgId={currentOrgId}
        mode={`update ${product.name}`}
        initialData={{
          orgId: currentOrgId,
          name: product.name,
          sku: product.sku,
          description: product.description,
          type: product.type,
          price: product.price,
          cost: product.cost,
          note: product.note || undefined,
        }}
        onSubmit={handleSubmit}
        isLoading={buttonLoading}
      />
      <ConfirmModal />
    </>
  );
}
