import React, { useState } from "react";

interface TableProps {
  headers: string[];
  data: (string | number | null | React.ReactElement)[][];
  columnCount?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedIndices: number[]) => void;
}

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
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
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
            <tr key={rowIndex} className="border-b border-gray-100">
              {selectable && (
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(rowIndex)}
                    onChange={(e) => handleSelectRow(rowIndex, e.target.checked)}
                  />
                </td>
              )}
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 px-4">
                  {cell || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
