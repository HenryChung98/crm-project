import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const currentPath = request.nextUrl.pathname;

  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/features",
    "/help",
    "/pricing",
    "/terms",
    "/privacy",
    "/public",
    "/v",
  ];
  const authPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/callback",
    "/auth/verify",
    "/auth/callback/confirmed",
    "/auth/callback/reset-password",
    "/auth/signin/reset-password",
  ];
  const protectedPaths = [
    "/orgs",
    "/dashboard",
    "/customers",
    "/settings",
    "/organizations",
    "/sales",
    "/subscription",
  ];

  const isPublicPath =
    currentPath === "/" || publicPaths.some((path) => path !== "/" && currentPath.startsWith(path));
  const isAuthPath = authPaths.some((path) => currentPath.startsWith(path));
  const isProtectedPath = protectedPaths.some((path) => currentPath.startsWith(path));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 유저 → 루트/auth 접근 시 리다이렉트
  if (user && (currentPath === "/" || isAuthPath)) {
    return NextResponse.redirect(new URL("/orgs", request.url));
  }

  // 비로그인 유저 → protected 접근 시 리다이렉트
  if (
    !user &&
    (isProtectedPath || (!isPublicPath && !isAuthPath && !currentPath.startsWith("/reset/")))
  ) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
