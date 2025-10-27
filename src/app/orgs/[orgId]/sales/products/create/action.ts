"use server";

import { withOrgAuth } from "@/utils/auth";
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
    const { orgMember, supabase } = await withOrgAuth(orgId, ["owner", "admin"]);

    if (!name || !sku || !description || !type || !price || !cost) {
      return { success: false, error: "Required fields are missing." };
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
      created_by: orgMember.user_id,
    };

    const { data: productInsertData, error } = await supabase
      .from("products")
      .insert([productData])
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const activityLogData = {
      organization_id: orgId,
      entity_id: productInsertData.id,
      entity_type: "product",
      action: "product-created",
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

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
