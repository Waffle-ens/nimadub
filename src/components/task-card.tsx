"use client";

import Link from "next/link";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
  };
  projectId: string;
}

export function TaskCard({ task, projectId }: TaskCardProps) {
  return (
    <Link href={`/projects/${projectId}/tasks/${task.id}`}>
      <div className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow">
        <p className="text-sm font-medium text-gray-900 line-clamp-3">
          {task.title}
        </p>
      </div>
    </Link>
  );
}
