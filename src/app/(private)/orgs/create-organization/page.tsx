"use client";

import React, { useState, useEffect } from "react";
import { createOrganization } from "./action";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

// custom hooks
import { useHasSubscription } from "@/shared-hooks/useHasSubscription";
import { useOwnOrganization } from "@/shared-hooks/useOwnOrganization";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { showSuccess, showError } from "@/shared-utils/feedback";
import { QueryErrorBanner } from "@/components/ui/QueryErrorBanner";
import { AccessDenied } from "@/components/AccessDenied";

interface OrganizationFormData {
  orgName: string;
  orgCountry: string;
  orgProvince: string;
  orgCity: string;
  url: string;
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
  const queryClient = useQueryClient();
  const [noProvince, setNoProvince] = useState<boolean>(false);
  const [ownOrg, setOwnOrg] = useState<boolean>(false);

  // check subscription
  const {
    hasData: hasSubscription,
    isLoading: isLoadingSubscription,
    error: hasSubscriptionError,
    refetch: hasSubscriptionRefetch,
  } = useHasSubscription();
  const {
    orgId: ownOrgId,
    isLoading: isLoadingOrganization,
    error: ownOrganizationError,
    refetch: ownOrganizationRefetch,
  } = useOwnOrganization();

  const [formData, setFormData] = useState<OrganizationFormData>({
    orgName: "",
    orgCountry: "",
    orgProvince: "",
    orgCity: "",
    url: "",
  });
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  useEffect(() => {
    if (hasSubscription === false) {
      router.push("/subscription");
      return;
    }

    if (ownOrgId) {
      setOwnOrg(true);
    }
  }, [hasSubscription, ownOrgId, router]);

  if (isLoadingSubscription || isLoadingOrganization) {
    return <LoadingSpinner />;
  }
  // =============================for form=============================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // province should be null or 2 char
    if (name === "orgProvince") {
      if (value !== "" && value.length !== 2) return;
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setButtonLoading(true);
    try {
      const res = await createOrganization(formData);
      if (res?.error) {
        showError(`Error: ${res.error}` || "Failed to create organization");
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["organizationMembers"],
        });

        showSuccess("Organization successfully created");
        window.location.href = `/orgs/${res.orgId}/dashboard`;
        // router.push(`/orgs/${ownOrgId}/dashboard`);
      }
    } catch (error) {
      showError("An error occurred.");
    } finally {
      setButtonLoading(false);
    }
  };
  // =============================/for form=============================
  if (ownOrg) {
    return (
      <AccessDenied
        title="Already own organization"
        message="You are allowed to own one organization"
      />
    );
  }
  return (
    <div>
      {hasSubscriptionError && (
        <QueryErrorBanner data="check has subscription" onRetry={() => hasSubscriptionRefetch} />
      )}
      {ownOrganizationError && (
        <QueryErrorBanner data="check own organization" onRetry={() => ownOrganizationRefetch} />
      )}
      {hasSubscription && (
        <Form action={handleSubmit} formTitle="organization">
          <FormField
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
            name="orgCity"
            type="text"
            placeholder="City"
            value={formData.orgCity}
            onChange={handleChange}
            required
            className="border w-full p-2"
          />
          <FormField
            name="url"
            type="text"
            placeholder="Your website URL"
            value={formData.url}
            onChange={handleChange}
            className="border w-full p-2"
          />
          <Button type="submit" disabled={buttonLoading}>
            {buttonLoading ? "Loading..." : "Start"}
          </Button>
        </Form>
      )}
    </div>
  );
}
