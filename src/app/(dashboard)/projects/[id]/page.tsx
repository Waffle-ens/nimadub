"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TaskBoard } from "@/components/task-board";
import type { TaskDTO, ProjectDTO } from "@/types";

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      setProject(data.data);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          description,
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        fetchTasks();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project?.name}</h1>
        {project?.description && (
          <p className="text-gray-600 mt-2">{project.description}</p>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              placeholder="Task title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              placeholder="Task description"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Task
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">Task Board</h2>
      <TaskBoard tasks={tasks} projectId={projectId} />
    </div>
  );
}
