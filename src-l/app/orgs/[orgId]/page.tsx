import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrgPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;

  if (orgId) {
    redirect(`/orgs/${orgId}/dashboard`);

    return <Link href={`/orgs/${orgId}/dashboard`}>go to dashboard</Link>;
  } else {
    redirect("/orgs");
  }
}
