import { NextResponse } from "next/server";
import { ownOrganization } from "@/shared-hooks/server/own-organization";

// to check if the user has own organization
export async function GET() {
  try {
    const has = await ownOrganization();
    return NextResponse.json({ has });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ has: false });
    }
    return NextResponse.json({ error: "Failed to check organization" }, { status: 500 });
  }
}
