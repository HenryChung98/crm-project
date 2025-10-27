import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  // 정적 파일 조기 리턴
  if (
    currentPath.startsWith("/_next") ||
    currentPath.startsWith("/api") ||
    /\.(jpg|jpeg|png|gif|svg|ico|webp|css|js)$/.test(currentPath)
  ) {
    return NextResponse.next();
  }

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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

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

  const isPublicPath = publicPaths.some((path) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  });
  const isAuthPath = authPaths.some((path) => currentPath.startsWith(path));
  const isProtectedPath = protectedPaths.some((path) => currentPath.startsWith(path));
  const isResetPath = currentPath.startsWith("/reset/");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 유저: 루트 또는 auth 페이지 접근 시 dashboard로 리다이렉트
  if (user && (currentPath === "/" || isAuthPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/orgs";
    return NextResponse.redirect(url);
  }

  // 비로그인 유저: protected 페이지 접근 시 signin으로 리다이렉트
  if (!user && (isProtectedPath || (!isPublicPath && !isAuthPath && !isResetPath))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
