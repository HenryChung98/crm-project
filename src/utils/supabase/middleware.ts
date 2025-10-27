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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  if (user) {
    if (currentPath === "/" || isAuthPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      console.log("Redirecting logged-in user from", currentPath, "to /dashboard");
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (!user) {
    if (isProtectedPath || (!isPublicPath && !isAuthPath && !isResetPath)) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      console.log("Redirecting non-authenticated user from", currentPath, "to /auth/signin");
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}
