"use server";

import { withOrgAuth } from "@/utils/auth";
import { revalidatePath } from "next/cache";

export async function updateProduct(productId: string, formData: FormData) {
  const orgId = formData.get("orgId")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const sku = formData.get("sku")?.toString().toUpperCase().trim();
  const description = formData.get("description")?.toString().trim();
  const type = formData.get("type")?.toString().trim();
  const price = formData.get("price")?.toString().trim();
  const cost = formData.get("cost")?.toString().trim();
  const note = formData.get("note")?.toString().trim();

  try {
    const { orgMember, supabase } = await withOrgAuth(orgId);

    if (!orgId || !name || !sku || !description || !type || !price || !cost) {
      return { success: false, error: "Required fields are missing." };
    }

    // Get existing product to compare changes
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("organization_id", orgId)
      .single();

    if (fetchError || !existingProduct) {
      return { success: false, error: "Product not found or access denied" };
    }

    const productData = {
      name,
      sku,
      description,
      type,
      price: parseFloat(price),
      cost: parseFloat(cost),
      note: note || null,
    };

    // Detect changes
    const changedData: Record<
      string,
      { old: string | number | null; new: string | number | null | undefined }
    > = {};

    // Need this for nullable columns
    const normalizedNote = note || null;
    const parsedPrice = parseFloat(price);
    const parsedCost = parseFloat(cost);

    if (existingProduct.name !== name) {
      changedData.name = { old: existingProduct.name, new: name };
    }
    if (existingProduct.sku !== sku) {
      changedData.sku = { old: existingProduct.sku, new: sku };
    }
    if (existingProduct.description !== description) {
      changedData.description = { old: existingProduct.description, new: description };
    }
    if (existingProduct.type !== type) {
      changedData.type = { old: existingProduct.type, new: type };
    }
    if (existingProduct.price !== parsedPrice) {
      changedData.price = { old: existingProduct.price, new: parsedPrice };
    }
    if (existingProduct.cost !== parsedCost) {
      changedData.cost = { old: existingProduct.cost, new: parsedCost };
    }
    if (existingProduct.note !== normalizedNote) {
      changedData.note = { old: existingProduct.note, new: normalizedNote };
    }

    // If no changes, return early
    if (Object.keys(changedData).length === 0) {
      return { success: true, productId, message: "No changes detected" };
    }

    // Update product
    const { error: updateError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", productId)
      .eq("organization_id", orgId);

    if (updateError) {
      return { error: updateError.message };
    }

    // Log only changed fields
    const activityLogData = {
      organization_id: orgId,
      entity_id: productId,
      entity_type: "product",
      action: "product-updated",
      changed_data: changedData,
      performed_by: orgMember.id,
    };

    const { error: activityLogError } = await supabase
      .from("activity_logs")
      .insert([activityLogData])
      .select("id")
      .single();

    if (activityLogError) {
      return { error: activityLogError.message };
    }

    revalidatePath(`/sales/products?org=${orgId}`);
    revalidatePath(`/sales/products/${productId}?org=${orgId}`);
    revalidatePath(`/dashboard?org=${orgId}`);

    return { success: true, productId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function removeProduct(productId: string, organizationId: string) {
  try {
    const { supabase, orgMember } = await withOrgAuth(organizationId);

    // Verify product exists and belongs to organization
    const { data: productToRemove, error: fetchError } = await supabase
      .from("products")
      .select("id, name, sku")
      .eq("id", productId)
      .eq("organization_id", organizationId)
      .single();

    if (fetchError || !productToRemove) {
      return { success: false, error: "Product not found or access denied" };
    }

    // Delete product
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("organization_id", organizationId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Log the deletion
    const activityLogData = {
      organization_id: organizationId,
      entity_id: productId,
      entity_type: "product",
      action: "product-deleted",
      changed_data: {
        product_name: productToRemove.name,
        product_sku: productToRemove.sku,
        deleted_at: new Date().toISOString(),
      },
      performed_by: orgMember.id,
    };

    const { error: activityLogError } = await supabase
      .from("activity_logs")
      .insert([activityLogData])
      .select("id")
      .single();

    if (activityLogError) {
      return { success: false, error: activityLogError.message };
    }

    revalidatePath("/sales/products");
    revalidatePath(`/sales/products/${productId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove product",
    };
  }
}