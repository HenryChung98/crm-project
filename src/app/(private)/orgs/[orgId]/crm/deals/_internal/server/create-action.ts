"use server";

import { requireOrgAccess } from "@/shared-utils/org-access";
import { validateDealCreation } from "@/shared-actions/action-validations";
import { revalidatePath } from "next/cache";
// resend
import { Resend } from "resend";
import { WelcomeEmail } from "@/components/resend-components/templates/WelcomeEmail";

export async function createDeal(formData: FormData) {
  const orgId = formData.get("orgId")?.toString().trim();
  const ownerId = formData.get("ownerId")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const stage = formData.get("stage")?.toString().trim();
  const note = formData.get("note")?.toString().trim();
  const contactId = formData.get("contactId")?.toString().trim();
  const productId = formData.get("productId")?.toString().trim();
  const sendEmail = formData.get("sendEmail")?.toString().trim();

  try {
    const { orgMember, supabase } = await requireOrgAccess(orgId, false);

    // check plan
    const validation = await validateDealCreation(orgId!);
    if (!validation.success) {
      return { error: validation.error };
    }

    // check all fields
    if (!orgId || !ownerId || !name || !stage || !contactId || !productId) {
      return { error: "Deal's name, stage, and email are required." };
    }

    if (name.length < 2 || /^\d+$/.test(name)) {
      return { error: "Invalid name." };
    }

    const dealData = {
      organization_id: orgId,
      owner_id: ownerId,
      name: name,
      stage: stage,
      contact_id: contactId,
      product_id: productId,
      note: note || null,
    };

    const { data: dealInsertData, error: dealDataError } = await supabase
      .from("deals")
      .insert([dealData])
      .select("id")
      .single();

    if (dealDataError) {
      return { error: dealDataError.message };
    }

    if (orgMember.organizations?.subscription?.plan.name === "premium") {
      const activityLogData = {
        organization_id: orgId,
        entity_id: dealInsertData.id,
        entity_type: "deal",
        action: "deal-create",
        changed_data: dealInsertData,
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
    
    // resend logic
    if (sendEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const { data: contactData } = await supabase
        .from("contacts")
        .select("email")
        .eq("id", contactId)
        .single();

      if (contactData?.email && process.env.RESEND_API_KEY) {
        try {
          const fromEmail =
            `${orgMember.organizations?.name}@${process.env.RESEND_DOMAIN}` ||
            process.env.DEFAULT_FROM_EMAIL;
          const fromName = orgMember.organizations?.name || "CRM-Project";

          await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: [contactData?.email],
            subject: `Welcome to ${fromName}!`,
            html: WelcomeEmail({
              name,
              orgName: fromName,
              orgEmail: orgMember.organizations?.email,
              orgPhone: orgMember.organizations?.phone,
            }),
          });
        } catch (emailError) {
          return {
            success: false,
            error: emailError instanceof Error ? emailError.message : "Unknown email error occured",
          };
        }
      }
    }
    revalidatePath(`orgs/${orgId}/crm/deals`);
    return { success: true, customerId: dealInsertData.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occured",
    };
  }
}
