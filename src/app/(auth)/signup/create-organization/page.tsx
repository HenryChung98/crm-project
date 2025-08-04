"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { countries } from "typed-countries";

interface OrganizationFormData {
  orgName: string;
  // orgCountry: string;
  orgProvince: string;
  orgCity: string;
}

interface Country {
  iso: string; // ISO Alpha‑2 코드 ("US", "CA" 등)
  name: string; // 국가명 ("United States")
  hasPostalCodes: boolean;
  region: string;
  states?: { iso: string; name: string }[]; // 주/도 리스트
  zipRegex?: string;
}

// continue with google if exists in public table ? signin / email-confirmed:true : signup2 page
// email verify redirect to signup2 page / email-confirmed: true

export default function CreateOrganizationPage() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const countries = require("typed-countries").countries;
  const sortedCountries = countries.sort((a: Country, b: Country) => a.name.localeCompare(b.name));

  const [country, setCountry] = useState<string>("");
  const [noProvince, setNoProvince] = useState<boolean>(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
  };

  const [formData, setFormData] = useState<OrganizationFormData>({
    orgName: "",
    // orgCountry: "",
    orgProvince: "",
    orgCity: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/auth/signup/create-organization", {
      method: "POST",
      body: JSON.stringify({
        orgName: formData.orgName.trim(),
        orgCountry: country,
        orgProvince: formData.orgProvince.toUpperCase().trim(),
        orgCity: formData.orgCity.trim(),
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/");
    } else {
      const result = await res.json();
      setError(result.error || "Failed to set your organization");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4 border w-1/3 m-auto p-4 rounded">
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
          value={country}
          onChange={handleSelectChange}
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
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "loading..." : "Start"}
        </button>
      </form>
    </div>
  );
}
