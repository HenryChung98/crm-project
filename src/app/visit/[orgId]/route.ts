import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkPlan } from "@/shared-actions/check-plan";
import { isExpired } from "@/shared-utils/validations";
import { notFound } from "next/navigation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const supabase = await createClient();
  const source = req.nextUrl.searchParams.get("src");
  const { orgId } = await params;

  const orgPlanData = await checkPlan(orgId);
  if (!orgPlanData) {
    return NextResponse.json({ error: "Failed to get user plan data" }, { status: 500 });
  }

  if (orgPlanData.subscription.plan.name !== "premium") {
    notFound();
  }
  // check if expired
  if (isExpired(orgPlanData.subscription.ends_at)) {
    notFound();
  }

  if (!orgPlanData.url) {
    return NextResponse.json({ error: "Organization url not found" }, { status: 404 });
  }

  // ============ Rate Limiting (1시간에 5회) ============
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentVisits } = await supabase
    .from("visit_logs")
    .select("id")
    .eq("ip_address", ip)
    .eq("organization_id", orgId)
    .gte("visited_at", oneHourAgo);

  if (recentVisits && recentVisits.length >= 5) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  // ============ Visit Logging ============
  // not using async for fast redirect
  supabase
    .from("visit_logs")
    .insert({
      organization_id: orgId,
      source: source,
      visited_at: new Date().toISOString(),
      ip_address: ip,
    })
    .then(({ error }) => {
      if (error) console.error("Failed to log visit:", error);
    });

  return NextResponse.redirect(orgPlanData.url, 302);
}
