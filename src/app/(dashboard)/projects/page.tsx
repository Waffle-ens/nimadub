"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProjectDTO } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setName("");
        setDescription("");
        fetchProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Projects</h1>

      <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="Project name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              placeholder="Project description"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Project
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center text-gray-500">No projects yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg cursor-pointer transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {project.description}
                  </p>
                )}
                <p className="text-gray-400 text-xs">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
