import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(req: NextRequest) {
  const res = await updateSession(req); // added
  const publicUrls: string[] = [];
  if (publicUrls.includes(req.nextUrl.pathname)) {
    return res;
  }

  return res;
}
export const config = {
  matcher: [
    /*
     * 제외 대상:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - 정적 파일 확장자 (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
