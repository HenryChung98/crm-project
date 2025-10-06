import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const supabase = await createClient();
  const source = req.nextUrl.searchParams.get("source") || "direct";
  const { customerId } = await params;

  // 방문 로그 기록
  await supabase.from("visit_logs").insert({
    customer_id: customerId,
    source: source, // 'instagram', 'facebook', 'email'
    visited_at: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
  });

  // 웹사이트로 리디렉트
  return Response.redirect("https://your-website.com", 302);
}
