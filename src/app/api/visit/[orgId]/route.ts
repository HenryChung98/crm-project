import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getPlanByOrg } from "../../../hooks/hook-actions/get-plans";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const supabase = await createClient();
  const source = req.nextUrl.searchParams.get("src");
  const { orgId } = await params;

  const orgPlanData = await getPlanByOrg(orgId);
  if (!orgPlanData?.plans) {
    return NextResponse.json({ error: "Failed to get user plan data" }, { status: 500 });
  }

  // check if expired
  if (orgPlanData.subscription.plan_id !== "75e0250f-909b-4074-bfa9-5dd140195fc2") {
    return NextResponse.json({ error: "premium only" }, { status: 403 });
  } else {
    const isExpired =
      orgPlanData.subscription.ends_at && new Date(orgPlanData.subscription.ends_at) < new Date();
    if (isExpired) {
      const errorMessage = `Current organization plan is expired.`;
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }
  }
  const { data: org, error } = await supabase
    .from("organizations")
    .select("url")
    .eq("id", orgId)
    .single();

  if (error || !org?.url) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // not using async for fast redirect
  supabase
    .from("visit_logs")
    .insert({
      organization_id: orgId,
      source: source,
      visited_at: new Date().toISOString(),
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    })
    .then(({ error }) => {
      if (error) console.error("Failed to log visit:", error);
    });

  return NextResponse.redirect(org.url, 302);
}
