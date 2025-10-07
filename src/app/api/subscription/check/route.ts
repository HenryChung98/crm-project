import { NextResponse } from "next/server";
import { hasSubscription } from "@/hooks/hook-actions/get-plans";

// to check if the user has a subscription
export async function GET() {
  try {
    const has = await hasSubscription();
    return NextResponse.json({ has });
  } catch (error: unknown) {
    // On auth errors, treat as no subscription rather than hanging the client
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ has: false });
    }
    return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 });
  }
}
