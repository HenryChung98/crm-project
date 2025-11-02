"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createProduct } from "./action";
import { useQueryClient } from "@tanstack/react-query";

// ui
import { showSuccess, showError } from "../../../../../../utils/feedback";
import { useConfirm } from "../../../../../../components/ui/ConfirmModal";

import { ProductForm, ProductFormData } from "../ProductForm";

export default function CreateProductPage() {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const params = useParams<{ orgId: string }>();
  const currentOrgId = params.orgId || "";
  const router = useRouter();
  const { confirm, ConfirmModal } = useConfirm();

  const createProductAction = async (data: ProductFormData) => {
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

      const res = await createProduct(formData);
      if (res?.error) {
        showError(`Error: ${res.error}` || "Failed to add customer");
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["products"],
        });
        showSuccess("Product successfully created");
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
        await createProductAction(data);
      },
      {
        title: "Create Product",
        message: "Are you sure you want to create this product?",
        confirmText: "Create",
        variant: "primary",
      }
    );
  };

  return (
    <>
      <ProductForm
        currentOrgId={currentOrgId}
        mode="create"
        onSubmit={handleSubmit}
        isLoading={buttonLoading}
      />
      <ConfirmModal />
    </>
  );
}
