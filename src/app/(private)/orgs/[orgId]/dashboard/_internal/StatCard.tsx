"use client";

import React, { useState, useMemo } from "react";
import { CiFilter } from "react-icons/ci";
import { BarChartComponent, PieChartComponent, LineChartComponent } from "./charts";
import { Dropdown } from "@/components/ui/Dropdown";
import { Checkbox, CheckboxContainer } from "@/components/ui/CheckBox";
import { DashboardStatsType } from "./dashboard-stats";

export const StatCard = React.memo(
  ({
    title,
    data,
    dataKeys,
    allowedCharts,
    labelMap,
  }: {
    title: string;
    data: DashboardStatsType | null;
    dataKeys: Array<keyof DashboardStatsType["30d"]>;
    allowedCharts: string[];
    labelMap?: Record<string, string>;
  }) => {
    const [selectedKeys, setSelectedKeys] = useState<string[]>(dataKeys);
    const [chartType, setChartType] = useState<string>("pie");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<
      "30d" | "60d" | "90d" | "180d" | "365d" | "total"
    >("30d");

    const getLabel = (key: string) => labelMap?.[key] || key;

    const handleCheckboxChange = (key: string) => {
      setSelectedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const subValues = useMemo(() => {
      if (!data) return {};
      const periodData = data[selectedPeriod];
      return dataKeys.reduce((acc, key) => {
        acc[key] = periodData[key];
        return acc;
      }, {} as Record<string, number>);
    }, [data, selectedPeriod, dataKeys]);

    const chartData = useMemo(
      () =>
        Object.entries(subValues)
          .filter(([key]) => selectedKeys.includes(key))
          .map(([key, val]) => ({ name: getLabel(key), value: val })),
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
            <div className="">
              <h3 className="font-bold uppercase">{title}</h3>
              {data && (
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
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Dropdown
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-sm"
              >
                {allowedCharts.includes("bar") && <option value="bar">Bar</option>}
                {allowedCharts.includes("pie") && <option value="pie">Pie</option>}
                {allowedCharts.includes("line") && <option value="line">Line</option>}
              </Dropdown>
              <Dropdown
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
                className="text-sm"
              >
                <option value="30d">Last 30 days</option>
                <option value="60d">Last 60 days</option>
                <option value="90d">Last 90 days</option>
                <option value="180d">Last 180 days</option>
                <option value="365d">Last 365 days</option>
                <option value="total">Total</option>
              </Dropdown>
            </div>
          </div>
        </div>
        {data && <div className="mt-10 h-80 items-center">{renderChart()}</div>}
      </div>
    );
  }
);
StatCard.displayName = "StatCard";