"use client";

import React, { useState } from "react";
import { createOrganization } from "./action";
import { useRouter } from "next/navigation";

// ui
import { Form } from "@/components/ui/Form";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { showSuccess, showError } from "@/utils/feedback";

interface OrganizationFormData {
  orgName: string;
  orgCountry: string;
  orgProvince: string;
  orgCity: string;
}

interface Country {
  iso: string; // ISO Alpha‑2 code ("US", "CA")
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
  // const [country, setCountry] = useState<string>("");
  const [noProvince, setNoProvince] = useState<boolean>(false);

  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setFormData.orgCountry(e.target.value);
  // };

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
      showSuccess("Organization successfully created");
      router.replace("/dashboard");
    }
  };

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
      {/* <form className="space-y-4 border w-1/3 m-auto p-4 rounded">
        <select
          name="orgCountry"
          value={formData.orgCountry}
          onChange={handleChange}
          required
          className="border w-full p-2 text-black"
        >
          <option value="">Select Country</option>
          {sortedCountries.map((c: Country) => (
            <option key={c.iso} value={c.iso}>
              {c.name}
            </option>
          ))}
        </select>
      </form> */}
    </div>
  );
}
