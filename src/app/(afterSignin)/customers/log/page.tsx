"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCustomerLogs } from "@/hooks/tanstack/useCustomerLogs";
import { CustomerLogs } from "@/types/database/customers";

interface ChangedData {
  note?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  tag?: string;
  last_name?: string;
  first_name?: string;
  organization_id?: string;
  [key: string]: string | undefined;
}

interface LogItemProps {
  log: CustomerLogs;
}

const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold">{log.id}</h3>
      <p className="text-gray-600">{log.customer_id}</p>
      <p className="text-gray-600">{new Date(log.performed_at).toLocaleString()}</p>
      <p className="text-gray-600">Action: {log.action}</p>
      <p className="text-gray-600">Performed by: {log.performed_by}</p>

      <div className="mt-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? "Hide" : "Show"} Changes
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-2">
            <div className="p-3 rounded">
              {log.changed_data &&
                typeof log.changed_data === "object" &&
                log.changed_data !== null &&
                !Array.isArray(log.changed_data) && (
                  <>
                    {(log.changed_data as unknown as ChangedData).first_name && (
                      <p className="text-sm">
                        <span className="font-medium">First Name:</span>{" "}
                        {(log.changed_data as unknown as ChangedData).first_name}
                      </p>
                    )}
                    {(log.changed_data as unknown as ChangedData).last_name && (
                      <p className="text-sm">
                        <span className="font-medium">Last Name:</span>{" "}
                        {(log.changed_data as unknown as ChangedData).last_name}
                      </p>
                    )}
                    {(log.changed_data as unknown as ChangedData).email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span>{" "}
                        {(log.changed_data as unknown as ChangedData).email}
                      </p>
                    )}
                    {(log.changed_data as unknown as ChangedData).phone && (
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span>{" "}
                        {(log.changed_data as unknown as ChangedData).phone}
                      </p>
                    )}
                    {(log.changed_data as unknown as ChangedData).status && (
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{" "}
                        {(log.changed_data as unknown as ChangedData).status}
                      </p>
                    )}
                    {(log.changed_data as unknown as ChangedData).tag && (
                      <p className="text-sm">
                        <span className="font-medium">Tag:</span>{" "}
                        {(log.changed_data as unknown as ChangedData).tag}
                      </p>
                    )}
                    {(log.changed_data as unknown as ChangedData).source && (
                      <p className="text-sm">
                        <span className="font-medium">Source:</span>{" "}
                        {(log.changed_data as unknown as ChangedData).source}
                      </p>
                    )}
                    {(log.changed_data as unknown as ChangedData).note && (
                      <p className="text-sm">
                        <span className="font-medium">Note:</span>{" "}
                        {(log.changed_data as unknown as ChangedData).note}
                      </p>
                    )}

                    {/* 다른 모든 필드들 */}
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Other changes:</p>
                      {Object.entries(log.changed_data as unknown as ChangedData)
                        .filter(
                          ([key]) =>
                            ![
                              "first_name",
                              "last_name",
                              "email",
                              "phone",
                              "status",
                              "tag",
                              "source",
                              "note",
                              "organization_id",
                            ].includes(key)
                        )
                        .map(([key, value]) => (
                          <p key={key} className="text-xs text-gray-600">
                            <span className="font-medium">{key}:</span> {value || "empty"}
                          </p>
                        ))}
                    </div>
                  </>
                )}
            </div>

            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                Show raw JSON
              </summary>
              <pre className="mt-1 p-2 rounded overflow-x-auto">
                {JSON.stringify(log.changed_data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CustomerLogPage() {
  const searchParams = useSearchParams();
  const currentOrgId = searchParams.get("org") || "";

  const { data: logs, isLoading, error } = useCustomerLogs(currentOrgId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      customer log page
      {logs?.map((log) => (
        <LogItem key={log.id} log={log} />
      ))}
    </>
  );
}
