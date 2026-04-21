"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APPROVAL_STATUS } from "@/types";
import type { ApprovalDTO } from "@/types";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/approvals", window.location.origin);
      if (statusFilter) url.searchParams.set("status", statusFilter);
      const res = await fetch(url);
      const data = await res.json();
      setApprovals(data.data || []);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApproval = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewedBy: "admin" }),
      });
      if (res.ok) {
        fetchApprovals();
      }
    } catch (error) {
      console.error("Error updating approval:", error);
    }
  };

  const statusBadgeClass = (status: string) => {
    if (status === APPROVAL_STATUS.PENDING) return "bg-yellow-100 text-yellow-800";
    if (status === APPROVAL_STATUS.APPROVED) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Approvals</h1>

      <div className="flex gap-2 mb-6">
        {[
          { label: "Pending", value: APPROVAL_STATUS.PENDING },
          { label: "Approved", value: APPROVAL_STATUS.APPROVED },
          { label: "Rejected", value: APPROVAL_STATUS.REJECTED },
          { label: "All", value: "" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              statusFilter === opt.value
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : approvals.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">No approvals found</div>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <div key={approval.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{approval.title}</h3>
                  {approval.task && (
                    <Link
                      href={`/projects/${approval.task.projectId}/tasks/${approval.task.id}`}
                      className="text-sm text-blue-600 hover:underline mt-1 block"
                    >
                      Task: {approval.task.title}
                    </Link>
                  )}
                  {approval.description && (
                    <p className="text-gray-600 text-sm mt-1">{approval.description}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${statusBadgeClass(approval.status)}`}>
                  {approval.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Requested: {new Date(approval.createdAt).toLocaleString()}</span>
                {approval.reviewedBy && (
                  <span>Reviewed by: {approval.reviewedBy}</span>
                )}
                {approval.reviewedAt && (
                  <span>at {new Date(approval.reviewedAt).toLocaleString()}</span>
                )}
              </div>

              {approval.status === APPROVAL_STATUS.PENDING && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleUpdateApproval(approval.id, APPROVAL_STATUS.APPROVED)}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateApproval(approval.id, APPROVAL_STATUS.REJECTED)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
