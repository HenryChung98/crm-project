"use client";
import { useParams } from "next/navigation";
import { useActivityLogs } from "@/hooks/tanstack/useActivityLogs";

import { FetchingSpinner } from "@/components/ui/LoadingSpinner";
import { QueryErrorUI } from "@/components/ui/QueryErrorUI";

export default function ActivityLogsPage() {
  const params = useParams<{ orgId: string }>();
  const currentOrgId = params.orgId || "";

  const { data: logs, isLoading, refetch, error } = useActivityLogs(currentOrgId);

  if (isLoading) return <FetchingSpinner />;
  if (error) return <QueryErrorUI error={error} onRetry={refetch} />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>

      {!logs || logs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No activity logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-4 border rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold capitalize">{log.action.replace("-", " ")}</span>
                  <span className="text-gray-500 ml-2">({log.entity_type})</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>Performed by: {log.organization_members?.user_email || "Unknown"}</p>

                {log.changed_data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View details
                    </summary>
                    <pre className="mt-2 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.changed_data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
