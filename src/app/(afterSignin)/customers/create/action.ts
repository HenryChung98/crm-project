"use server";

import { withOrgAuth } from "@/utils/auth";
import { validateResourceCreation } from "@/utils/validation";
import { revalidatePath } from "next/cache";

// resend
import { Resend } from "resend";
import { WelcomeEmail } from "@/components/resend-components/templates/WelcomeEmail";

export async function createCustomer(formData: FormData) {
  const orgId = formData.get("orgId")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const note = formData.get("note")?.toString().trim();

  try {
    const { orgMember, supabase } = await withOrgAuth(orgId);

    // ========================================== check plan ==========================================
    const validation = await validateResourceCreation({
      orgId: orgId!,
      orgMember,
      resourceType: "customers",
    });
    if (!validation.success) {
      return { error: validation.error };
    }
    // ========================================== /check plan ==========================================

    // check all fields
    if (!orgId || !name || (!email && !phone)) {
      return { error: "Customer's name, and either email or phone number are required." };
    }

    if (name.length < 2 || /^\d+$/.test(name)) {
      return { error: "Invalid name." };
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { error: "Invalid email address." };
      }
    }

    // check duplicate
    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return { error: checkError.message };
    }
    if (existingCustomer) {
      return { error: "This customer already exists." };
    }

    const customerData = {
      organization_id: orgId,
      name: name,
      source: `By ${orgMember.user_email}`,
      email: email || null,
      phone: phone || null,
      note: note || null,
      status: "customer",
    };

    const { data: customerInsertData, error: customerDataError } = await supabase
      .from("customers")
      .insert([customerData])
      .select("id")
      .single();

    if (customerDataError) {
      return { error: customerDataError.message };
    }

    const activityLogData = {
      organization_id: orgId,
      entity_id: customerInsertData.id,
      entity_type: "customer",
      action: "customer-created",
      changed_data: customerData,
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

    // resend logic
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data: orgData } = await supabase
      .from("organizations")
      .select("name, email, phone")
      .eq("id", orgId)
      .single();

    if (email && process.env.RESEND_API_KEY) {
      try {
        const fromEmail =
          `${orgData?.name}@${process.env.RESEND_DOMAIN}` || process.env.DEFAULT_FROM_EMAIL;
        const fromName = orgData?.name || "CRM-Project";
        // const orgEmail = orgData?.email || "this guy has no email";
        // const orgPhone = orgData?.phone || "this guy has no phone";

        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [email],
          subject: `Welcome to ${fromName}!`,
          html: WelcomeEmail({
            name,
            orgName: fromName,
            orgEmail: orgData?.email,
            orgPhone: orgData?.phone,
          }),
        });
      } catch (emailError) {
        return {
          success: false,
          error: emailError instanceof Error ? emailError.message : "Unknown email error occured",
        };
      }
    }
    revalidatePath(`/customers?org=${orgId}`);
    revalidatePath(`/dashboard?org=${orgId}`);
    revalidatePath(`/customers/log?org=${orgId}`);
    return { success: true, customerId: customerInsertData.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occured",
    };
  }
}
