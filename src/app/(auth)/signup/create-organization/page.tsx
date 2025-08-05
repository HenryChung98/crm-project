"use client";

import React, { useState } from "react";
import { createOrganization } from "./action";
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

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // province should be null or 2 char
    if (name === "orgProvince") {
      if (value !== "" && value.length !== 2) return;
    }
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const res = await createOrganization(formData);

    if (res?.error) {
      setError(res.error);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">organization</h1>
      <form action={handleSubmit} className="space-y-4 border w-1/3 m-auto p-4 rounded">
        <div>
          <input
            name="orgName"
            type="text"
            placeholder="Organization Name"
            value={formData.orgName}
            onChange={handleChange}
            required
            className="border w-full p-2"
          />
        </div>

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
        <div>
          <input
            name="orgProvince"
            type="text"
            placeholder="Province / State"
            value={formData.orgProvince}
            onChange={handleChange}
            required
            disabled={noProvince}
            className={`border w-full p-2 ${noProvince ? "bg-red-500" : ""}`}
          />
          <div
            onClick={() => {
              setNoProvince((prev) => !prev);
              setFormData((prev) => ({
                ...prev,
                orgProvince: "",
              }));
            }}
          >
            no province
          </div>
        </div>
        <input
          name="orgCity"
          type="text"
          placeholder="City"
          value={formData.orgCity}
          onChange={handleChange}
          required
          className="border w-full p-2"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Start
        </button>
      </form>
    </div>
  );
}
