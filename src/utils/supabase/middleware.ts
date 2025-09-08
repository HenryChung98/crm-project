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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    user &&
    (request.nextUrl.pathname === "/auth/signin" ||
      request.nextUrl.pathname === "/auth/signup" ||
      request.nextUrl.pathname === "/auth" ||
      request.nextUrl.pathname === "/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 디버깅을 위한 로그
  console.log("Middleware - Current path:", request.nextUrl.pathname);
  console.log("Middleware - User:", user ? "Logged in" : "Not logged in");

  // 공개 경로 정의 (로그인이 필요하지 않은 경로들)
  const publicPaths = [
    "/",
    "/(beforesignin)",
    "/auth/signin",
    "/auth",
    "/auth/signup",
    "/auth/verify",
    "/auth/signin/reset",
  ];

  // 현재 경로가 공개 경로인지 확인
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // (afterSignin) 경로에 대한 특별 처리
  if (request.nextUrl.pathname.startsWith("/(afterSignin)")) {
    if (!user) {
      // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉트
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      return NextResponse.redirect(url);
    }
    // 로그인된 사용자는 접근 허용
    return supabaseResponse;
  }

  // /subscription 경로에 대한 특별 처리
  if (request.nextUrl.pathname.startsWith("/subscription")) {
    if (!user) {
      console.log("Middleware - Redirecting to /auth/signin");
      // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉트
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      return NextResponse.redirect(url);
    }
    // 로그인된 사용자는 접근 허용
    return supabaseResponse;
  }

  // 공개 경로가 아니고 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
