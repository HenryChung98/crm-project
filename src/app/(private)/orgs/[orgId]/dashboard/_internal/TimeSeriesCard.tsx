import React, { useState, useMemo } from "react";
import { CiFilter } from "react-icons/ci";
import { LineChartComponent } from "./charts";
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

export const TimeSeriesCard = React.memo(
  ({
    title,
    data,
    dataKeys,
    labelMap,
  }: {
    title: string;
    data: MonthlyStatsData[];
    dataKeys: Array<keyof Omit<MonthlyStatsData, "year" | "month">>;
    labelMap?: Record<string, string>;
  }) => {
    const [selectedKeys, setSelectedKeys] = useState<string[]>(dataKeys);
    const [isOpen, setIsOpen] = useState(false);

    const availableYears = useMemo(() => {
      const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => b - a);
      return years;
    }, [data]);

    const [selectedYear, setSelectedYear] = useState<number>(
      availableYears[0] || new Date().getFullYear()
    );

    const getLabel = (key: string) => labelMap?.[key] || key;

    const chartData = useMemo(() => {
      const filteredData = data.filter((d) => d.year === selectedYear);

      // 1월~12월 전체 배열 생성
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
    }, [data, selectedYear, dataKeys, selectedKeys, labelMap]);

    const displayKeys = useMemo(() => selectedKeys.map(getLabel), [selectedKeys, labelMap]);

    return (
      <div className="p-6 h-128 border border-gray-200 rounded-lg overflow-auto flex flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold uppercase tracking-wide">{title}</h3>
            <CheckboxContainer
              isOpen={isOpen}
              onToggle={() => setIsOpen(!isOpen)}
              selectedCount={selectedKeys.length}
              buttonLabel={<CiFilter />}
              className="border border-border rounded-lg bg-input"
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
                    onChange={() =>
                      setSelectedKeys((prev) =>
                        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                      )
                    }
                  />
                ))}
            </CheckboxContainer>
          </div>
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
        <div className="mt-10 h-80">
          <LineChartComponent data={chartData} dataKeys={displayKeys} />
        </div>
      </div>
    );
  }
);
TimeSeriesCard.displayName = "TimeSeriesCard";
