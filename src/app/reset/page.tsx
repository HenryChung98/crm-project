import { redirect } from "next/navigation";

export default function ResetPage() {
  redirect("/auth/signin/reset-password");
}
