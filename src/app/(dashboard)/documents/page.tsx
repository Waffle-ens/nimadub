"use client";

import { useEffect, useState } from "react";
import { DOCUMENT_TYPE } from "@/types";
import type { DocumentDTO } from "@/types";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "OTHER",
    content: "",
  });

  useEffect(() => {
    fetchDocuments();
  }, [selectedType]);

  const fetchDocuments = async () => {
    try {
      const url = new URL("/api/documents", window.location.origin);
      if (selectedType) url.searchParams.set("type", selectedType);
      const res = await fetch(url);
      const data = await res.json();
      setDocuments(data.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ title: "", type: "OTHER", content: "" });
        setShowForm(false);
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Documents</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Types</option>
          {Object.values(DOCUMENT_TYPE).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Close" : "Create Document"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full"
            />
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full"
            >
              {Object.values(DOCUMENT_TYPE).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full"
              rows={6}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateDocument}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center text-gray-500">No documents found</div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold">{doc.title}</h3>
                <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                  {doc.type}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-3">
                {doc.content}
              </p>
              <p className="text-gray-400 text-xs mt-4">
                Created {new Date(doc.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
