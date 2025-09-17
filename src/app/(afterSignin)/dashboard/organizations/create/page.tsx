"use client";

import React, { useState, useEffect } from "react";
import { createOrganization } from "./action";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query"; // 추가

import { useSubscriptionCheck } from "@/hooks/tanstack/usePlan";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"; // 추가
import { showSuccess, showError } from "@/utils/feedback";

interface OrganizationFormData {
  orgName: string;
  orgCountry: string;
  orgProvince: string;
  orgCity: string;
}

interface Country {
  iso: string;
  name: string;
  hasPostalCodes: boolean;
  region: string;
  states?: { iso: string; name: string }[];
  zipRegex?: string;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const countries = require("typed-countries").countries;

const sortedCountries = countries.sort((a: Country, b: Country) => a.name.localeCompare(b.name));

export default function CreateOrganizationPage() {
  const router = useRouter();
  const queryClient = useQueryClient(); // 추가
  const [noProvince, setNoProvince] = useState<boolean>(false);

  // check subscription
  const { hasSubscription, isLoading: isLoadingSubscription } = useSubscriptionCheck();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoadingSubscription) return;
    if (pathname === "/subscription") return;

    if (hasSubscription === false) {
      router.replace("/subscription");
      return;
    }
  }, [hasSubscription, isLoadingSubscription, pathname, router]);

  const [formData, setFormData] = useState<OrganizationFormData>({
    orgName: "",
    orgCountry: "",
    orgProvince: "",
    orgCity: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // province should be null or 2 char
    if (name === "orgProvince") {
      if (value !== "" && value.length !== 2) return;
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const res = await createOrganization(formData);

    if (res?.error) {
      showError(`Error: ${res.error}`);
    } else {
      // 🟢 조직 생성 후 관련 쿼리 캐시 무효화
      await queryClient.invalidateQueries({
        queryKey: ["organizationMembers"],
      });

      showSuccess("Organization successfully created");
      router.replace("/dashboard");
    }
  };

  // 🟢 로딩 중이면 스피너 표시
  if (isLoadingSubscription) {
    return <LoadingSpinner />;
  }

  // 🟢 구독이 없으면 빈 화면 (리다이렉트 중)
  if (hasSubscription === false) {
    return null;
  }

  return (
    <div>
      <Form action={handleSubmit} formTitle="organization">
        <FormField
          label="Organization Name"
          name="orgName"
          type="text"
          placeholder="Org 1"
          value={formData.orgName}
          onChange={handleChange}
          required
          className="border w-full p-2"
        />
        <Dropdown name="orgCountry" value={formData.orgCountry} onChange={handleChange} required>
          <option value="">Select Country</option>
          {sortedCountries.map((c: Country) => (
            <option key={c.iso} value={c.iso}>
              {c.name}
            </option>
          ))}
        </Dropdown>
        <FormField
          label="Province / State"
          name="orgProvince"
          type="text"
          placeholder="Province / State"
          value={formData.orgProvince}
          onChange={handleChange}
          required
          disabled={noProvince}
          className={`border w-full p-2 ${noProvince ? "bg-red-500" : ""}`}
        />
        <Button
          variant="warning"
          type="button"
          onClick={() => {
            setNoProvince((prev) => !prev);
            setFormData((prev) => ({
              ...prev,
              orgProvince: "",
            }));
          }}
        >
          no province
        </Button>
        <FormField
          label="City"
          name="orgCity"
          type="text"
          placeholder="City"
          value={formData.orgCity}
          onChange={handleChange}
          required
          className="border w-full p-2"
        />

        <Button type="submit">Start</Button>
      </Form>
    </div>
  );
}
