"use client";

import React, { useState, useMemo } from "react";
import { CiFilter } from "react-icons/ci";
import { BarChartComponent, LineChartComponent } from "./charts";
import { Dropdown } from "@/components/ui/Dropdown";
import { Checkbox, CheckboxContainer } from "@/components/ui/CheckBox";
import { MonthlyStatsData } from "./dashboard-stats";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const MonthlyStatCard = React.memo(
  ({
    title,
    data,
    dataKeys,
    allowedCharts,
    labelMap,
  }: {
    title: string;
    data: MonthlyStatsData[];
    dataKeys: Array<keyof Omit<MonthlyStatsData, "year" | "month">>;
    allowedCharts: string[];
    labelMap?: Record<string, string>;
  }) => {
    const [selectedKeys, setSelectedKeys] = useState<string[]>(dataKeys);
    const [chartType, setChartType] = useState<string>(allowedCharts[0]);
    const [isOpen, setIsOpen] = useState(false);

    const availableYears = useMemo(() => {
      const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => b - a);
      return years;
    }, [data]);

    const [selectedYear, setSelectedYear] = useState<number>(
      availableYears[0] || new Date().getFullYear()
    );

    const getLabel = (key: string) => labelMap?.[key] || key;

    const handleCheckboxChange = (key: string) => {
      setSelectedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const chartData = useMemo(() => {
      const filteredData = data.filter((d) => d.year === selectedYear);
      const monthlyMap = new Map(filteredData.map((d) => [d.month, d]));

      return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const monthData = monthlyMap.get(month);

        return {
          name: MONTH_NAMES[i],
          ...dataKeys.reduce((acc, key) => {
            if (selectedKeys.includes(key)) {
              acc[getLabel(key)] = monthData?.[key] || 0;
            }
            return acc;
          }, {} as Record<string, number>),
        };
      });
    }, [data, selectedYear, dataKeys, selectedKeys]);

    const displayKeys = useMemo(() => selectedKeys.map(getLabel), [selectedKeys]);

    const renderChart = () => {
      switch (chartType) {
        case "line":
          return <LineChartComponent data={chartData} dataKeys={displayKeys} />;
        default:
          return <BarChartComponent data={chartData} dataKeys={displayKeys} />;
      }
    };

    return (
      <div className="p-6 h-128 border border-gray-200 rounded-lg overflow-auto flex flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold uppercase">{title}</h3>
            <CheckboxContainer
              isOpen={isOpen}
              onToggle={() => setIsOpen(!isOpen)}
              selectedCount={selectedKeys.length}
              buttonLabel={<CiFilter />}
              className="border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <Checkbox
                label="All"
                checked={selectedKeys.length === dataKeys.length}
                onChange={(e) => setSelectedKeys(e.target.checked ? dataKeys : [])}
                className="mb-4 font-medium"
              />
                {dataKeys.map((key) => (
                  <Checkbox
                    key={key}
                    label={getLabel(key)}
                    checked={selectedKeys.includes(key)}
                    onChange={() => handleCheckboxChange(key)}
                  />
                ))}
            </CheckboxContainer>
          </div>
          <div className="flex flex-col gap-1">
            <Dropdown
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="text-sm"
            >
              {allowedCharts.includes("bar") && <option value="bar">Bar</option>}
              {allowedCharts.includes("line") && <option value="line">Line</option>}
            </Dropdown>
            <Dropdown
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Dropdown>
          </div>
        </div>
        <div className="mt-10 h-80">{renderChart()}</div>
      </div>
    );
  }
);
MonthlyStatCard.displayName = "MonthlyStatCard";