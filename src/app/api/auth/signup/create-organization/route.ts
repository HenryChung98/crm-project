import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const formData = await req.json();
    const { orgName, orgCountry, orgProvince, orgCity } = formData;

    if (!orgName || !orgCountry || !orgCity) {
      return NextResponse.json(
        { error: "Organization's name, country, and city are required." },
        { status: 400 }
      );
    }

    // province validation
    const isValidProvince = !orgProvince || orgProvince.length === 2;
    if (!isValidProvince) {
      return NextResponse.json(
        { error: "Province/state must be exactly 2 characters." },
        { status: 400 }
      );
    }

    // get user data from auth.user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Failed to get user:", userError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, email, created_at, last_sign_in_at, email_confirmed_at, user_metadata } = user;

    const { first_name, last_name, image } = user_metadata || {};

    // insert organization data to the table
    const orgProfile = {
      name: orgName,
      country: orgCountry,
      state_province: orgProvince,
      city: orgCity,
      created_by: id 
    };
    const { data: orgInsertData, error: orgProfileError } = await supabase
      .from("organizations")
      .insert([orgProfile])
      .select("id")
      .single();

    if (orgProfileError) {
      const msg = orgProfileError.message;
      if (msg.includes("duplicate")) {
        return NextResponse.json({ error: "The organization name already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // get organization id
    const orgId = orgInsertData.id;

    // insert user data to the table
    const userProfile = {
      id: id,
      organization_id: orgId,
      email: email,
      first_name: first_name,
      last_name: last_name,
      role: "owner",
      created_at: created_at,
      last_sign_in_at: last_sign_in_at,
      email_confirmed_at: email_confirmed_at,
      image: image,
    };

    // check user id is duplicated, and insert after
    const { error: userProfileError } = await supabase
      .from("users")
      .upsert([userProfile], { onConflict: "id" });

    if (userProfileError) {
      const msg = userProfileError.message;

      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({
      message: "Signup successful",
      orgId,
      user: userProfile,
    });
  } catch (err) {
    console.error("Unexpected signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
