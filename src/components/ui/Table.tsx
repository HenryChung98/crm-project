import React, { useState } from "react";

interface CellData {
  value: string | number | null | React.ReactElement;
  className?: string;
  textColor?: string;
  bgColor?: string;
  icon?: React.ReactElement;
  iconPosition?: "left" | "right";
}

type CellContent = string | number | null | React.ReactElement | CellData;

interface TableProps {
  headers: string[];
  data: CellContent[][];
  columnCount?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedIndices: number[]) => void;
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, indeterminate = false }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        ref={(input) => {
          if (input) input.indeterminate = indeterminate;
        }}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-4 h-4 border-2 border-gray-400 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
        <svg
          className="w-3 h-3 text-white hidden peer-checked:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </label>
  );
};

const isCellData = (cell: CellContent): cell is CellData => {
  return cell !== null && typeof cell === "object" && "value" in cell;
};

export const Table: React.FC<TableProps> = ({
  headers,
  data,
  columnCount = headers.length,
  selectable = false,
  onSelectionChange,
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const displayHeaders = headers.slice(0, columnCount);
  const displayData = data.map((row) => {
    const slicedRow = row.slice(0, columnCount);
    while (slicedRow.length < columnCount) {
      slicedRow.push(null);
    }
    return slicedRow;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = new Set(data.map((_, index) => index));
      setSelectedRows(allIndices);
      onSelectionChange?.(Array.from(allIndices));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (rowIndex: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowIndex);
    } else {
      newSelected.delete(rowIndex);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            {selectable && (
              <th className="text-left py-3 px-4">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            {displayHeaders.map((header, index) => (
              <th key={index} className="text-left py-3 px-4 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-100 ${
                selectedRows.has(rowIndex) ? "opacity-50" : ""
              }`}
            >
              {selectable && (
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedRows.has(rowIndex)}
                    onChange={(checked) => handleSelectRow(rowIndex, checked)}
                  />
                </td>
              )}
              {row.map((cell, cellIndex) => {
                const cellData = isCellData(cell) ? cell : { value: cell };
                const {
                  value,
                  className,
                  textColor,
                  bgColor,
                  icon,
                  iconPosition = "left",
                } = cellData;

                return (
                  <td
                    key={cellIndex}
                    className={`py-3 px-4 ${className || ""}`}
                    style={{
                      color: textColor,
                      backgroundColor: bgColor,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {icon && iconPosition === "left" && icon}
                      <span>{value || "-"}</span>
                      {icon && iconPosition === "right" && icon}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
