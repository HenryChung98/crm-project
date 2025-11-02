"use client";
import Link from "next/link";
import { EMPTY_ARRAY } from "@/types/customData";

export default function OrgPage() {
  return (
    <>
      <div className="rounded-lg shadow-sm border p-12 text-center">
        <h2 className="text-2xl font-semibold text-text-secondary mb-4">
          You currently have no organizations
        </h2>
        <p className="text-text-secondary text-lg">
          Please
          <Link href="/organizations/create" className="text-blue-500">
            &nbsp;create&nbsp;
          </Link>
          or join an organization
        </p>
      </div>
    </>
  );
}
