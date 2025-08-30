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

  // ========================= check subscription =========================
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/(afterSignin)");

  if (user && isProtectedRoute && !request.nextUrl.pathname.startsWith("/pricing")) {
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id);

    // subscription이 없으면 pricing으로 리다이렉트
    if (!subscriptions || subscriptions.length === 0) {
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      return NextResponse.redirect(url);
    }
  }

  // ========================= check subscription =========================

  // ========================= check subscription status =========================

  // if (user) {
  //   const { data: subscriptions } = await supabase
  //     .from("subscriptions")
  //     .select(`*, plans (*)`)
  //     .eq("user_id", user.id);
  //   const restrictedPaths = ["/organizations/create"];

  //   // 구독이 있는 경우에만 처리
  //   if (subscriptions && subscriptions.length > 0) {
  //     // 가장 최신 구독 또는 활성화된 구독을 찾기
  //     const activeSubscription =
  //       subscriptions.find((sub) => sub.status !== "free") ||
  //       subscriptions.sort(
  //         (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  //       )[0];

  //     if (activeSubscription?.status !== "free") {
  //       const isExpired =
  //         activeSubscription?.ends_at && new Date(activeSubscription.ends_at) < new Date();
  //       // also update status to expired

  //       if (isExpired) {
  //         const pathname = request.nextUrl.pathname;
  //         const isRestrictedPath = restrictedPaths.some((path) => pathname.includes(path));

  //         if (isRestrictedPath) {
  //           const url = request.nextUrl.clone();
  //           url.pathname = "/pricing";
  //           return NextResponse.redirect(url);
  //         }
  //       }
  //       if (activeSubscription?.payment_status !== "paid") {
  //         const pathname = request.nextUrl.pathname;
  //         const isRestrictedPath = restrictedPaths.some((path) => pathname.includes(path));
  //         if (isRestrictedPath) {
  //           const url = request.nextUrl.clone();
  //           console.log("payment status is not paid");
  //           return NextResponse.redirect(url);
  //         }
  //       }
  //     }
  //   }
  // }

  // ========================= /check subscription status ========================

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

  // /pricing 경로에 대한 특별 처리
  if (request.nextUrl.pathname.startsWith("/pricing")) {
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
