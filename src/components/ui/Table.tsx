import React from "react";

interface TableProps {
  headers: string[];
  data: (string | number | null | React.ReactElement)[][];
  columnCount?: number;
}

export const Table: React.FC<TableProps> = ({ headers, data, columnCount = headers.length }) => {
  // columnCount가 headers보다 작으면 해당 개수만큼만 표시
  const displayHeaders = headers.slice(0, columnCount);
  const displayData = data.map((row) => {
    const slicedRow = row.slice(0, columnCount);
    // columnCount만큼 길이를 맞춰줌
    while (slicedRow.length < columnCount) {
      slicedRow.push(null);
    }
    return slicedRow;
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
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
