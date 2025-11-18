"use server";

import { requireOrgAccess } from "@/shared-utils/org-access";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const orgId = formData.get("orgId")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const sku = formData.get("sku")?.toString().toUpperCase().trim();
  const description = formData.get("description")?.toString().trim();
  const type = formData.get("type")?.toString().trim();
  const price = formData.get("price")?.toString().trim();
  const cost = formData.get("cost")?.toString().trim();
  const note = formData.get("note")?.toString().trim();

  try {
    const { orgMember, supabase } = await requireOrgAccess(orgId, false);

    // check all fields
    if (!orgId || !name || !sku || !description || !type || !price || !cost) {
      return { success: false, error: "Required fields are missing." };
    }

    if (name.length < 2 || /^\d+$/.test(name)) {
      return { error: "Invalid name." };
    }

    if (sku.length < 2 || /^\d+$/.test(name)) {
      return { error: "Invalid SKU." };
    }

    if (parseFloat(price) < 0 || parseFloat(cost) < 0) {
      return { error: "Invalid price or cost." };
    }

    const productData = {
      organization_id: orgId,
      name: name,
      sku: sku,
      description: description,
      type: type,
      price: parseFloat(price),
      cost: parseFloat(cost),
      note: note || null,
      created_by: orgMember.id,
    };

    const { data: productInsertData, error } = await supabase
      .from("products")
      .insert([productData])
      .select("id")
      .single();

    if (error) {
      if (error.message.includes("products_name_key")) {
        return {
          success: false,
          error: "A product with this name already exists in your organization.",
        };
      }
      if (error.message.includes("products_sku_key")) {
        return {
          success: false,
          error: "A product with this SKU already exists in your organization.",
        };
      }
      return { success: false, error: error.message };
    }

    if (orgMember.organizations?.subscription?.plan.name === "premium") {
      const activityLogData = {
        organization_id: orgId,
        entity_id: productInsertData.id,
        entity_type: "product",
        action: "product-create",
        changed_data: productData,
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
    }
    revalidatePath(`/orgs/${orgId}/sales/products`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occured",
    };
  }
}
