"use client";

import { useEffect, useState } from "react";
import type { AuditLogDTO } from "@/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [selectedEntity]);

  const fetchLogs = async () => {
    try {
      const url = new URL("/api/audit-logs", window.location.origin);
      if (selectedEntity) url.searchParams.set("entity", selectedEntity);
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const entities = [
    "Task",
    "Project",
    "Approval",
    "Decision",
    "Document",
    "TaskMessage",
    "MemorySnapshot",
    "GithubLink",
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Audit Logs</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Entity</label>
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="w-full max-w-xs"
        >
          <option value="">All Entities</option>
          {entities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-500">No audit logs found</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-medium">{log.entity}</span>
                  <span className="text-gray-600 mx-2">•</span>
                  <span className="text-gray-700">{log.action}</span>
                </div>
                <span className="text-gray-500 text-sm">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              {log.actor && (
                <p className="text-sm text-gray-600">By: {log.actor}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">ID: {log.entityId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
