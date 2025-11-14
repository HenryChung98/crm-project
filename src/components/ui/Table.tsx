import React, { useState } from "react";
import { Dropdown } from "./Dropdown";

interface CellData {
  value: string | number | null | React.ReactElement;
  rawValue?: string | number;
  className?: string;
  textColor?: string;
  bgColor?: string;
  icon?: React.ReactElement;
  iconPosition?: "left" | "right";
}

type CellContent = string | number | null | React.ReactElement | CellData;

interface TableProps {
  headers: string[];
  data: CellContent[][] | undefined;
  columnCount: number;
  onSelectionChange?: (selectedIndices: number[]) => void;
  filterOptions?: string[];
  filterColumn?: number;
  pageSize: number;
  editableColumns?: number[];
  onCellEdit?: (
    rowIndex: number,
    columnIndex: number,
    newValue: string,
    originalRowData: CellContent[]
  ) => Promise<void>;
  isDeletable?: boolean;
  onBulkRemove?: () => void;
  selectedIndices?: number[];
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

const getCellValue = (cell: CellContent): string => {
  if (cell === null) return "";
  if (React.isValidElement(cell)) return "";
  if (isCellData(cell)) {
    if (cell.rawValue !== undefined) {
      return String(cell.rawValue);
    }
    const value = cell.value;
    if (value === null || React.isValidElement(value)) return "";
    return String(value);
  }
  return String(cell);
};

const exportToCSV = (headers: string[], data: CellContent[][], columnCount: number) => {
  const displayHeaders = headers.slice(0, columnCount);
  const csvRows = [];

  csvRows.push(displayHeaders.join(","));

  data.forEach((row) => {
    const values = row.slice(0, columnCount).map((cell) => {
      const value = getCellValue(cell);
      return `"${value.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  });

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `export_${new Date().getTime()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToExcel = (headers: string[], data: CellContent[][], columnCount: number) => {
  const displayHeaders = headers.slice(0, columnCount);

  let html = "<table><thead><tr>";
  displayHeaders.forEach((header) => {
    html += `<th>${header}</th>`;
  });
  html += "</tr></thead><tbody>";

  data.forEach((row) => {
    html += "<tr>";
    row.slice(0, columnCount).forEach((cell) => {
      const value = getCellValue(cell);
      html += `<td>${value}</td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `export_${new Date().getTime()}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const Table: React.FC<TableProps> = ({
  headers,
  data,
  columnCount = headers.length,
  onSelectionChange,
  filterOptions = [],
  filterColumn,
  pageSize = 10,
  editableColumns = [],
  onCellEdit,
  isDeletable = false,
  onBulkRemove,
  selectedIndices = [],
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filterValue, setFilterValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Sync external selectedIndices with internal selectedRows
  React.useEffect(() => {
    setSelectedRows(new Set(selectedIndices));
  }, [selectedIndices]);

  const displayHeaders = headers.slice(0, columnCount);
  const normalizedData: CellContent[][] = data ?? [];

  let filteredData = normalizedData;

  if (filterValue && filterColumn !== undefined) {
    filteredData = filteredData.filter((row) => {
      const cell = row[filterColumn];
      const cellValue = isCellData(cell) ? cell.value : cell;
      return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
    });
  }
  if (searchValue) {
    filteredData = filteredData.filter((row) => {
      return row.slice(0, columnCount).some((cell) => {
        const searchableValue = getCellValue(cell);
        return searchableValue.toLowerCase().includes(searchValue.toLowerCase());
      });
    });
  }

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const displayData = paginatedData.map((row) => {
    const slicedRow = row.slice(0, columnCount);
    while (slicedRow.length < columnCount) {
      slicedRow.push(null);
    }
    return slicedRow;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = new Set(paginatedData.map((_, index) => index));
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

  const isAllSelected = displayData.length > 0 && selectedRows.size === displayData.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < displayData.length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRows(new Set());
    onSelectionChange?.([]);
  };

  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    if (editableColumns.length > 0 && !editableColumns.includes(colIndex)) {
      return;
    }

    const cell = displayData[rowIndex][colIndex];
    const currentValue = getCellValue(cell);
    setEditingCell({ row: rowIndex, col: colIndex });
    setEditValue(currentValue);
  };

  const handleEditSave = async (rowIndex: number, colIndex: number) => {
    if (!onCellEdit || editValue === getCellValue(displayData[rowIndex][colIndex])) {
      setEditingCell(null);
      return;
    }

    const originalRowData = paginatedData[rowIndex];

    try {
      await onCellEdit(rowIndex, colIndex, editValue, originalRowData);
      setEditingCell(null);
    } catch (error) {
      console.error("Edit failed:", error);
      setEditingCell(null);
    }
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const isEditing = (rowIndex: number, colIndex: number) => {
    return editingCell?.row === rowIndex && editingCell?.col === colIndex;
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-3 items-center">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setCurrentPage(1);
            setSelectedRows(new Set());
            onSelectionChange?.([]);
          }}
          placeholder="Search..."
          className="px-3 py-2 border border-gray-300 rounded"
        />

        {filterOptions.length > 0 && filterColumn !== undefined && (
          <Dropdown
            value={filterValue}
            onChange={(e) => {
              setFilterValue(e.target.value);
              setCurrentPage(1);
              setSelectedRows(new Set());
              onSelectionChange?.([]);
            }}
          >
            <option value="">All</option>
            {filterOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </Dropdown>
        )}

        <div className="ml-auto flex gap-2">
          {isDeletable && selectedRows.size > 0 && (
            <button
              onClick={onBulkRemove}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Selected ({selectedRows.size})
            </button>
          )}
          <button
            onClick={() => exportToCSV(headers, filteredData, columnCount)}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportToExcel(headers, filteredData, columnCount)}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-3 px-4">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                />
              </th>

              {displayHeaders.map((header, index) => (
                <th key={index} className="text-left px-4 font-bold text-sm min-w-[250px]">
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
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedRows.has(rowIndex)}
                    onChange={(checked) => handleSelectRow(rowIndex, checked)}
                  />
                </td>

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

                  const isEditableCell =
                    editableColumns.length === 0 || editableColumns.includes(cellIndex);

                  return (
                    <td
                      key={cellIndex}
                      className={`text-sm px-3 min-w-[250px] ${className || ""} ${
                        isEditableCell ? "cursor-pointer" : ""
                      }`}
                      style={{
                        color: textColor,
                        backgroundColor: bgColor,
                      }}
                      onDoubleClick={() => handleCellDoubleClick(rowIndex, cellIndex)}
                    >
                      {isEditing(rowIndex, cellIndex) ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave(rowIndex, cellIndex)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleEditSave(rowIndex, cellIndex);
                            } else if (e.key === "Escape") {
                              handleEditCancel();
                            }
                          }}
                          autoFocus
                          className="w-full px-2 py-1 border border-blue-500 rounded"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {icon && iconPosition === "left" && icon}
                          <span>{value || "-"}</span>
                          {icon && iconPosition === "right" && icon}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};