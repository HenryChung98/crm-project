import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { Resend } from "resend";
import { notFound } from "next/navigation";

import { isExpired } from "@/shared-utils/validations";
import { WelcomeEmail } from "@/components/resend-components/templates/WelcomeEmail";
import { checkPlan } from "@/shared-actions/check-plan";
import { isValidEmail } from "@/shared-utils/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, source, name, email, phone } = body;
    const supabase = await createClient();

    // check plan
    const orgPlanData = await checkPlan(orgId);
    if (!orgPlanData) {
      return NextResponse.json({ error: "Failed to get user plan data" }, { status: 500 });
    }

    // check if expired
    if (orgPlanData.subscription.plan.name !== "premium") {
      notFound();
    }
    if (isExpired(orgPlanData.subscription.ends_at)) {
      notFound();
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

    // ============ Spam Protection ============

    // 1. Rate Limiting (1시간에 5회)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSubmissions } = await supabase
      .from("public_form_submissions")
      .select("id")
      .eq("ip_address", ip)
      .gte("created_at", oneHourAgo);

    if (recentSubmissions && recentSubmissions.length >= 5) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    // 2. 필수 필드 체크
    if (!orgId || !name || (!email && !phone)) {
      return NextResponse.json(
        { error: "Name and either email or phone are required." },
        { status: 400 }
      );
    }

    // 3. 기본 validation
    if (name.length < 2 || /^\d+$/.test(name)) {
      return NextResponse.json({ error: "Invalid name." }, { status: 400 });
    }

    // 4. 이메일 검증
    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // 5. 중복 체크
    if (email) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("organization_id", orgId)
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "You have already submitted this form." },
          { status: 400 }
        );
      }
    }

    // ============ Customer 생성 ============

    const customerData = {
      organization_id: orgId,
      name,
      email: email || null,
      phone: phone || null,
      note: null,
      source: `Public Lead Form - ${source}`,
      status: "lead",
    };

    const { data: customer, error: insertError } = await supabase
      .from("customers")
      .insert([customerData])
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit form. Please try again." },
        { status: 500 }
      );
    }

    // ============ Rate Limiting 기록 ============

    await supabase.from("public_form_submissions").insert([
      {
        organization_id: orgId,
        customer_id: customer.id,
        ip_address: ip,
      },
    ]);

    // ============ Welcome Email 전송 ============

    if (email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const fromEmail =
          `${orgPlanData?.name}@${process.env.RESEND_DOMAIN}` || process.env.DEFAULT_FROM_EMAIL;
        const fromName = orgPlanData?.name || "CRM-Project";

        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [email],
          subject: `Thank you for your interest in ${fromName}`,
          html: WelcomeEmail({
            name,
            orgName: fromName,
            orgEmail: orgPlanData?.email,
            orgPhone: orgPlanData?.phone,
          }),
        });
      } catch (emailError) {
        await supabase.from("customers").delete().eq("id", customer.id);
        console.error("Email error:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id,
    });
  } catch (error) {
    console.error("Public form error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
