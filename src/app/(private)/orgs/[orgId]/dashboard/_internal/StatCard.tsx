"use client";

import React, { useState, useMemo } from "react";
import { BarChartComponent, PieChartComponent, LineChartComponent } from "./charts";
import { Dropdown } from "@/components/ui/Dropdown";
import { Checkbox, CheckboxContainer } from "@/components/ui/CheckBox";

export const StatCard = React.memo(
  ({
    title,
    value,
    subValues,
    allowedCharts,
  }: {
    title: string;
    value: number;
    subValues?: Record<string, number>;
    allowedCharts: string[];
  }) => {
    const [selectedKeys, setSelectedKeys] = useState<string[]>(Object.keys(subValues ?? {}));
    const [chartType, setChartType] = useState<string>("bar");
    const [isOpen, setIsOpen] = useState(false);

    const handleCheckboxChange = (key: string) => {
      setSelectedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const chartData = useMemo(
      () =>
        Object.entries(subValues ?? {})
          .filter(([key]) => selectedKeys.includes(key))
          .map(([key, val]) => ({ name: key, value: val })),
      [subValues, selectedKeys]
    );

    const renderChart = () => {
      switch (chartType) {
        case "pie":
          return <PieChartComponent data={chartData} />;
        case "line":
          return <LineChartComponent data={chartData} />;
        default:
          return <BarChartComponent data={chartData} />;
      }
    };

    return (
      <div className="p-6 h-128 border border-gray-200 rounded-lg overflow-auto flex flex-col">
        <div className="flex flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold uppercase tracking-wide">{title}</h3>
              <p className="mt-3">Total: {value ?? 0}</p>
            </div>
            <Dropdown
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              label="Chart"
              className="text-sm"
            >
              {allowedCharts.includes("bar") && <option value="bar">Bar</option>}
              {allowedCharts.includes("pie") && <option value="pie">Pie</option>}
              {allowedCharts.includes("line") && <option value="line">Line</option>}
            </Dropdown>
          </div>
          {subValues && (
            <CheckboxContainer
              isOpen={isOpen}
              onToggle={() => setIsOpen(!isOpen)}
              selectedCount={selectedKeys.length}
              className="mt-3"
            >
              <Checkbox
                label="All"
                checked={selectedKeys.length === Object.keys(subValues).length}
                onChange={(e) => setSelectedKeys(e.target.checked ? Object.keys(subValues) : [])}
                className="mb-4 font-medium"
              />
              <div className="grid grid-cols-4 gap-4">
                {Object.keys(subValues).map((key) => (
                  <Checkbox
                    key={key}
                    label={key}
                    checked={selectedKeys.includes(key)}
                    onChange={() => handleCheckboxChange(key)}
                  />
                ))}
              </div>
            </CheckboxContainer>
            // <div className="flex gap-4 mt-5">
            //   <div>
            //     <Checkbox
            //       label="All"
            //       checked={selectedKeys.length === Object.keys(subValues).length}
            //       onChange={(e) => setSelectedKeys(e.target.checked ? Object.keys(subValues) : [])}
            //       className="mb-2 font-medium"
            //     />
            //     <div className="flex flex-wrap gap-4 overflow-auto">
            //       {Object.keys(subValues).map((key) => (
            //         <Checkbox
            //           key={key}
            //           label={key}
            //           checked={selectedKeys.includes(key)}
            //           onChange={() => handleCheckboxChange(key)}
            //         />
            //       ))}
            //     </div>
            //   </div>
            // </div>
          )}
        </div>
        {subValues && <div className="mt-10 h-80 items-center">{renderChart()}</div>}
      </div>
    );
  }
);
StatCard.displayName = "StatCard";
