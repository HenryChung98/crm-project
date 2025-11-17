// page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createOrganization } from "./action";
import { useRouter } from "next/navigation";
import { validateOrganizationField } from "./validation";

// custom hooks
import { useHasSubscription } from "../subscription/_internal/useHasSubscription";
import { useOrganization } from "@/contexts/OrganizationContext";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { showSuccess, showError } from "@/components/feedback";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";
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
  const [noProvince, setNoProvince] = useState<boolean>(false);

  const { orgMemberLoading, ownOrganization } = useOrganization();

  // check subscription
  const {
    subscriptionId,
    isLoading: isLoadingSubscription,
    error: hasSubscriptionError,
    refetch: hasSubscriptionRefetch,
  } = useHasSubscription();

  const [formData, setFormData] = useState<OrganizationFormData>({
    orgName: "",
    orgCountry: "",
    orgProvince: "",
    orgCity: "",
    url: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoadingSubscription) return;
    if (!subscriptionId) {
      router.push("/orgs/subscription");
      return;
    }
  }, [subscriptionId, router, isLoadingSubscription]);

  if (isLoadingSubscription || orgMemberLoading) {
    return <LoadingSpinner />;
  }

  const validateField = (name: string, value: string) => {
    const error = validateOrganizationField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // province should be null or 2 char
    if (name === "orgProvince") {
      if (value !== "" && value.length > 2) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return;
    }

    setButtonLoading(true);
    try {
      const submissionData = new FormData();
      submissionData.append("orgName", formData.orgName);
      submissionData.append("orgCountry", formData.orgCountry);
      submissionData.append("orgProvince", noProvince ? "" : formData.orgProvince);
      submissionData.append("orgCity", formData.orgCity);
      submissionData.append("url", formData.url);

      if (subscriptionId) {
        submissionData.append("subscriptionId", subscriptionId);
      }

      const res = await createOrganization(submissionData);
      if (res?.error) {
        showError(`Error: ${res.error}` || "Failed to create organization");
        setButtonLoading(false);
      } else {
        showSuccess("Organization successfully created");
        window.location.href = `/orgs/${res.orgId}/dashboard`;
      }
    } catch (error) {
      showError("An error occurred.");
      setButtonLoading(false);
    }
  };

  if (ownOrganization) {
    return (
      <AccessDenied
        title="Already own organization"
        message="You are allowed to own one organization"
      />
    );
  }

  const hasErrors = Object.values(errors).some((error) => error !== "" && error !== "SILENT_ERROR");

  return (
    <div>
      {hasSubscriptionError && !ownOrganization && (
        <QueryErrorUI
          data="check has subscription"
          error={hasSubscriptionError}
          onRetry={() => hasSubscriptionRefetch}
        />
      )}
      {subscriptionId && (
        <Form onSubmit={handleSubmit} formTitle="organization">
          <FormField
            name="orgName"
            type="text"
            placeholder="e.g., Acme Corporation"
            value={formData.orgName}
            onChange={handleChange}
            error={errors.orgName}
            required
            className="border w-full p-2"
          />
          <Dropdown 
            name="orgCountry" 
            value={formData.orgCountry} 
            onChange={handleChange}
            error={errors.orgCountry}
            required
          >
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
            placeholder="e.g., CA"
            value={formData.orgProvince}
            onChange={handleChange}
            error={errors.orgProvince}
            required={!noProvince}
            disabled={noProvince}
            className={`border w-full p-2 ${noProvince ? "bg-muted" : ""}`}
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
              setErrors((prev) => ({ ...prev, orgProvince: "" }));
            }}
          >
            {noProvince ? "Add Province" : "No Province"}
          </Button>
          <FormField
            name="orgCity"
            type="text"
            placeholder="e.g., San Francisco"
            value={formData.orgCity}
            onChange={handleChange}
            error={errors.orgCity}
            required
            className="border w-full p-2"
          />
          <FormField
            name="url"
            type="text"
            placeholder="https://example.com"
            value={formData.url}
            onChange={handleChange}
            error={errors.url}
            className="border w-full p-2"
          />
          <Button type="submit" disabled={buttonLoading || hasErrors}>
            {buttonLoading ? "Loading..." : "Start"}
          </Button>
        </Form>
      )}
    </div>
  );
}