"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  TASK_STATUS,
  APPROVAL_STATUS,
  MEMORY_TYPE,
  DOCUMENT_TYPE,
  GITHUB_LINK_TYPE,
} from "@/types";
import type {
  TaskDTO,
  AuditLogDTO,
  DocumentDTO,
  GithubLinkDTO,
} from "@/types";

type TabName = "overview" | "messages" | "decisions" | "documents" | "approvals" | "memory" | "github" | "audit";

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<TaskDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>("overview");

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      setTask(data.data);
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          title: task.title,
          description: task.description,
          acceptanceCriteria: task.acceptanceCriteria,
        }),
      });
      if (res.ok) fetchTask();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  if (loading) return <div className="text-center text-gray-500 mt-12">Loading...</div>;
  if (!task) return <div className="text-center text-gray-500 mt-12">Task not found</div>;

  const TABS: { id: TabName; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "messages", label: "Messages" },
    { id: "decisions", label: "Decisions" },
    { id: "documents", label: "Documents" },
    { id: "approvals", label: "Approvals" },
    { id: "memory", label: "Memory" },
    { id: "github", label: "GitHub" },
    { id: "audit", label: "Audit" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">{task.title}</h1>
        {task.description && (
          <p className="text-gray-600">{task.description}</p>
        )}
        <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded ${
          task.status === "BLOCKED" ? "bg-red-100 text-red-800" :
          task.status === "DONE" ? "bg-green-100 text-green-800" :
          task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {task.status}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab task={task} onStatusChange={handleStatusChange} />
          )}
          {activeTab === "messages" && <MessagesTab task={task} />}
          {activeTab === "decisions" && <DecisionsTab task={task} />}
          {activeTab === "documents" && <DocumentsTab taskId={taskId} />}
          {activeTab === "approvals" && <ApprovalsTab task={task} />}
          {activeTab === "memory" && <MemoryTab task={task} />}
          {activeTab === "github" && <GithubTab taskId={taskId} initialLinks={task.githubLinks ?? []} />}
          {activeTab === "audit" && <AuditTab taskId={taskId} />}
        </div>
      </div>
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewTab({
  task,
  onStatusChange,
}: {
  task: TaskDTO;
  onStatusChange: (status: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-64"
        >
          {Object.values(TASK_STATUS).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      {task.acceptanceCriteria && (
        <div>
          <label className="block text-sm font-medium mb-2">Acceptance Criteria</label>
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">
            {task.acceptanceCriteria}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Messages ────────────────────────────────────────────────────────────────

function MessagesTab({ task }: { task: TaskDTO }) {
  const [messages, setMessages] = useState(task.messages ?? []);
  const [content, setContent] = useState("");
  const [role, setRole] = useState<"user" | "assistant" | "system">("user");

  const handleAddMessage = async () => {
    if (!content.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([...messages, data.data]);
        setContent("");
      }
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  const roleStyle = (r: string) => {
    if (r === "assistant") return "bg-blue-50 border-blue-100";
    if (r === "system") return "bg-yellow-50 border-yellow-100";
    return "bg-white border-gray-100";
  };

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto space-y-3 bg-gray-50 p-4 rounded border">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No messages yet</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`p-3 rounded border ${roleStyle(msg.role)}`}>
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">{msg.role}</p>
            <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
          className="w-32"
        >
          <option value="user">user</option>
          <option value="assistant">assistant</option>
          <option value="system">system</option>
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1"
          placeholder="Add a message..."
          rows={3}
        />
        <button
          onClick={handleAddMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 h-fit self-end"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Decisions ───────────────────────────────────────────────────────────────

function DecisionsTab({ task }: { task: TaskDTO }) {
  const [decisions, setDecisions] = useState(task.decisions ?? []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", context: "", decision: "", rationale: "" });

  const handleAdd = async () => {
    if (!form.title || !form.context || !form.decision) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setDecisions([data.data, ...decisions]);
        setForm({ title: "", context: "", decision: "", rationale: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding decision:", error);
    }
  };

  return (
    <div className="space-y-4">
      {decisions.map((d) => (
        <div key={d.id} className="border border-gray-200 p-4 rounded space-y-2">
          <h3 className="font-semibold text-gray-900">{d.title}</h3>
          <p className="text-sm text-gray-600"><strong>Context:</strong> {d.context}</p>
          <p className="text-sm text-gray-700"><strong>Decision:</strong> {d.decision}</p>
          {d.rationale && (
            <p className="text-sm text-gray-500"><strong>Rationale:</strong> {d.rationale}</p>
          )}
          <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleString()}</p>
        </div>
      ))}

      {showForm ? (
        <div className="border border-blue-200 p-4 rounded space-y-3 bg-blue-50">
          <input
            type="text" placeholder="Title *" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full"
          />
          <textarea
            placeholder="Context *" value={form.context} rows={2}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            className="w-full"
          />
          <textarea
            placeholder="Decision *" value={form.decision} rows={2}
            onChange={(e) => setForm({ ...form, decision: e.target.value })}
            className="w-full"
          />
          <textarea
            placeholder="Rationale (optional)" value={form.rationale} rows={2}
            onChange={(e) => setForm({ ...form, rationale: e.target.value })}
            className="w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Decision
        </button>
      )}
    </div>
  );
}

// ─── Documents ───────────────────────────────────────────────────────────────

function DocumentsTab({ taskId }: { taskId: string }) {
  const [docs, setDocs] = useState<DocumentDTO[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "OTHER", content: "" });

  useEffect(() => {
    fetchDocs();
  }, [taskId]);

  const fetchDocs = async () => {
    try {
      const res = await fetch(`/api/documents?taskId=${taskId}`);
      const data = await res.json();
      setDocs(data.data ?? []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleAdd = async () => {
    if (!form.title || !form.content) return;
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, taskId }),
      });
      if (res.ok) {
        const data = await res.json();
        setDocs([data.data, ...docs]);
        setForm({ title: "", type: "OTHER", content: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  return (
    <div className="space-y-4">
      {docs.map((doc) => (
        <div key={doc.id} className="border border-gray-200 p-4 rounded">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold">{doc.title}</h3>
            <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">{doc.type}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{doc.content}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(doc.createdAt).toLocaleString()}</p>
        </div>
      ))}

      {showForm ? (
        <div className="border border-blue-200 p-4 rounded space-y-3 bg-blue-50">
          <input
            type="text" placeholder="Title *" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full"
          >
            {Object.values(DOCUMENT_TYPE).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <textarea
            placeholder="Content *" value={form.content} rows={5}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Document
        </button>
      )}
    </div>
  );
}

// ─── Approvals ───────────────────────────────────────────────────────────────

function ApprovalsTab({ task }: { task: TaskDTO }) {
  const [approvals, setApprovals] = useState(task.approvals ?? []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const handleAdd = async () => {
    if (!form.title) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setApprovals([...approvals, data.data]);
        setForm({ title: "", description: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding approval:", error);
    }
  };

  const handleUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewedBy: "admin" }),
      });
      if (res.ok) {
        const data = await res.json();
        setApprovals(approvals.map((a) => (a.id === id ? data.data : a)));
      }
    } catch (error) {
      console.error("Error updating approval:", error);
    }
  };

  const statusBadge = (status: string) => {
    if (status === APPROVAL_STATUS.PENDING) return "bg-yellow-100 text-yellow-800";
    if (status === APPROVAL_STATUS.APPROVED) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-4">
      {approvals.map((a) => (
        <div key={a.id} className="border border-gray-200 p-4 rounded">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold">{a.title}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${statusBadge(a.status)}`}>
              {a.status}
            </span>
          </div>
          {a.description && <p className="text-sm text-gray-600 mb-2">{a.description}</p>}
          {a.status === APPROVAL_STATUS.PENDING && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleUpdate(a.id, APPROVAL_STATUS.APPROVED)}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdate(a.id, APPROVAL_STATUS.REJECTED)}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}

      {showForm ? (
        <div className="border border-blue-200 p-4 rounded space-y-3 bg-blue-50">
          <input
            type="text" placeholder="Title *" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full"
          />
          <textarea
            placeholder="Description (optional)" value={form.description} rows={2}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Request Approval
        </button>
      )}
    </div>
  );
}

// ─── Memory ──────────────────────────────────────────────────────────────────

function MemoryTab({ task }: { task: TaskDTO }) {
  const [snapshots, setSnapshots] = useState(task.memorySnapshots ?? []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: MEMORY_TYPE.TASK, title: "", content: "" });

  const handleAdd = async () => {
    if (!form.title || !form.content) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/memory-snapshots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setSnapshots([data.data, ...snapshots]);
        setForm({ type: MEMORY_TYPE.TASK, title: "", content: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding snapshot:", error);
    }
  };

  const typeBadgeColor: Record<string, string> = {
    CONSTITUTION: "bg-purple-100 text-purple-800",
    SPRINT: "bg-blue-100 text-blue-800",
    TASK: "bg-gray-100 text-gray-800",
    RESET_SUMMARY: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="space-y-4">
      {snapshots.map((s) => (
        <div key={s.id} className="border border-gray-200 p-4 rounded">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold">{s.title}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${typeBadgeColor[s.type] ?? "bg-gray-100 text-gray-800"}`}>
              {s.type}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.content}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(s.createdAt).toLocaleString()}</p>
        </div>
      ))}

      {showForm ? (
        <div className="border border-blue-200 p-4 rounded space-y-3 bg-blue-50">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
            className="w-full"
          >
            {Object.values(MEMORY_TYPE).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="text" placeholder="Title *" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full"
          />
          <textarea
            placeholder="Content *" value={form.content} rows={4}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Memory Snapshot
        </button>
      )}
    </div>
  );
}

// ─── GitHub ──────────────────────────────────────────────────────────────────

function GithubTab({ taskId, initialLinks }: { taskId: string; initialLinks: GithubLinkDTO[] }) {
  const [links, setLinks] = useState<GithubLinkDTO[]>(initialLinks);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: GITHUB_LINK_TYPE.ISSUE, url: "", number: "", title: "" });

  const handleAdd = async () => {
    if (!form.url || !form.number) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/github-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, number: parseInt(form.number, 10) }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinks([data.data, ...links]);
        setForm({ type: GITHUB_LINK_TYPE.ISSUE, url: "", number: "", title: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding github link:", error);
    }
  };

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div key={link.id} className="border border-gray-200 p-4 rounded flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                link.type === "pr" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}>
                {link.type.toUpperCase()} #{link.number}
              </span>
            </div>
            {link.title && <p className="text-sm text-gray-700">{link.title}</p>}
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline break-all"
            >
              {link.url}
            </a>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className="border border-blue-200 p-4 rounded space-y-3 bg-blue-50">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
            className="w-full"
          >
            <option value={GITHUB_LINK_TYPE.ISSUE}>Issue</option>
            <option value={GITHUB_LINK_TYPE.PR}>Pull Request</option>
          </select>
          <input
            type="number" placeholder="Number * (e.g. 42)" value={form.number}
            onChange={(e) => setForm({ ...form, number: e.target.value })}
            className="w-full"
          />
          <input
            type="url" placeholder="URL * (https://github.com/...)" value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full"
          />
          <input
            type="text" placeholder="Title (optional)" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Link</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Link GitHub Issue / PR
        </button>
      )}
    </div>
  );
}

// ─── Audit ───────────────────────────────────────────────────────────────────

function AuditTab({ taskId }: { taskId: string }) {
  const [logs, setLogs] = useState<AuditLogDTO[]>([]);

  useEffect(() => {
    fetch(`/api/audit-logs?taskId=${taskId}`)
      .then((r) => r.json())
      .then((data) => setLogs(data.data ?? []))
      .catch((e) => console.error("Error fetching audit logs:", e));
  }, [taskId]);

  const actionColor: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    STATUS_CHANGE: "bg-purple-100 text-purple-800",
    DELETE: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-3">
      {logs.length === 0 && (
        <p className="text-center text-gray-400 text-sm">No audit logs yet</p>
      )}
      {logs.map((log) => (
        <div key={log.id} className="border border-gray-200 p-3 rounded text-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">{log.entity}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${actionColor[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                {log.action}
              </span>
            </div>
            <span className="text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
          {log.actor && <p className="text-gray-500 text-xs">By: {log.actor}</p>}
        </div>
      ))}
    </div>
  );
}
