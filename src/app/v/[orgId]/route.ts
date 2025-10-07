import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const supabase = await createClient();
  const source = req.nextUrl.searchParams.get("src");
  const { orgId } = await params;

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
