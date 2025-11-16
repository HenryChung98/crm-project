"use server";

import { requireOrgAccess } from "@/shared-utils/org-access";
import { validateContactCreation } from "@/shared-actions/action-validations";
import { revalidatePath } from "next/cache";
import { isValidEmail } from "@/shared-utils/validations";
// resend
import { Resend } from "resend";
import { WelcomeEmail } from "../../../../../components/resend-components/templates/WelcomeEmail";

export async function createContact(formData: FormData) {
  const orgId = formData.get("orgId")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const status = formData.get("status")?.toString().trim();
  const jobTitle = formData.get("jobTitle")?.toString().trim();
  const note = formData.get("note")?.toString().trim();

  try {
    const { orgMember, supabase } = await requireOrgAccess(orgId, false);

    // check plan
    const validation = await validateContactCreation(orgId!);
    if (!validation.success) {
      return { error: validation.error };
    }

    // check all fields
    if (!orgId || !name || !status || !email) {
      return { error: "Customer's name, status, and email are required." };
    }

    if (name.length < 2 || /^\d+$/.test(name)) {
      return { error: "Invalid name." };
    }

    if (email && !isValidEmail(email)) {
      return { error: "Invalid email address." };
    }

    // check duplicate
    let query = supabase.from("contacts").select("id").eq("organization_id", orgId);

    if (email && phone) {
      query = query.or(`(email.eq.${email},phone.eq.${phone})`);
    } else if (email) {
      query = query.eq("email", email);
    } else if (phone) {
      query = query.eq("phone", phone);
    }

    const { data: existingCustomer, error: checkError } = await query.single();
    // const { data: existingCustomer, error: checkError } = await supabase
    //   .from("contacts")
    //   .select("id")
    //   .or(`(email.eq.${email},phone.eq.${phone})`)
    //   .eq("organization_id", orgId)
    //   .single();

    if (checkError && checkError.code !== "PGRST116") {
      return { error: checkError.message };
    }
    if (existingCustomer) {
      return { error: "This customer already exists." };
    }

    const contactData = {
      organization_id: orgId,
      name: name,
      source: `By ${orgMember.user_email}`,
      email: email || null,
      phone: phone || null,
      job_title: jobTitle || null,
      note: note || null,
      status: status,
    };

    const { data: contactInsertData, error: contactDataError } = await supabase
      .from("contacts")
      .insert([contactData])
      .select("id")
      .single();

    if (contactDataError) {
      return { error: contactDataError.message };
    }

    if (orgMember.organizations?.subscription?.plan.name === "premium") {
      const activityLogData = {
        organization_id: orgId,
        entity_id: contactInsertData.id,
        entity_type: "contact",
        action: "contact-created",
        changed_data: contactData,
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
    const resend = new Resend(process.env.RESEND_API_KEY);

    // const { data: orgData } = await supabase
    //   .from("organizations")
    //   .select("name, email, phone")
    //   .eq("id", orgId)
    //   .single();

    if (email && process.env.RESEND_API_KEY) {
      try {
        const fromEmail =
          `${orgMember.organizations?.name}@${process.env.RESEND_DOMAIN}` ||
          process.env.DEFAULT_FROM_EMAIL;
        const fromName = orgMember.organizations?.name || "CRM-Project";
        // const orgEmail = orgData?.email || "this guy has no email";
        // const orgPhone = orgData?.phone || "this guy has no phone";

        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [email],
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
    revalidatePath(`/orgs/${orgId}/crmcontact`);
    return { success: true, customerId: contactInsertData.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occured",
    };
  }
}
