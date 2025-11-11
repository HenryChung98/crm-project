import React, { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

export const StatCard = React.memo(
  ({
    title,
    value,
    subValues,
  }: {
    title: string;
    value: number;
    subValues?: Record<string, number>;
  }) => {
    const [filter, setFilter] = useState<string>("all");

    const filteredEntries =
      filter === "all"
        ? Object.entries(subValues ?? {})
        : Object.entries(subValues ?? {}).filter(([key]) => key === filter);

    return (
      <div className="p-6 h-128 border border-border rounded-lg shadow-sm text-center hover:shadow-md transition-shadow overflow-auto">
        <h3 className="text-sm font-medium uppercase tracking-wide">{title}</h3>
        <p className="mt-3 text-3xl font-bold">{value ?? 0}</p>

        {subValues && (
          <>
            <Dropdown value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              {Object.keys(subValues).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </Dropdown>

            <div className="text-sm space-y-1">
              {filteredEntries.map(([key, val]) => (
                <div key={key}>
                  {key}: {val}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
);
StatCard.displayName = "StatCard";
