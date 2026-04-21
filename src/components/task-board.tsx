"use client";

import { TaskStatus, TASK_STATUS } from "@/types";
import { TaskCard } from "./task-card";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  projectId: string;
}

interface TaskBoardProps {
  tasks: Task[];
  projectId: string;
}

const COLUMNS = [
  { status: TASK_STATUS.BACKLOG, label: "Backlog" },
  { status: TASK_STATUS.READY, label: "Ready" },
  { status: TASK_STATUS.IN_PROGRESS, label: "In Progress" },
  { status: TASK_STATUS.REVIEW, label: "Review" },
  { status: TASK_STATUS.QA, label: "QA" },
  { status: TASK_STATUS.STAGING, label: "Staging" },
  { status: TASK_STATUS.DONE, label: "Done" },
  { status: TASK_STATUS.BLOCKED, label: "Blocked" },
];

export function TaskBoard({ tasks, projectId }: TaskBoardProps) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-6 min-w-full pb-6">
        {COLUMNS.map((column) => (
          <div
            key={column.status}
            className={`flex-shrink-0 w-80 rounded-lg p-4 ${
              column.status === "BLOCKED" ? "bg-red-50" : "bg-gray-100"
            }`}
          >
            <h2 className={`font-bold mb-4 ${column.status === "BLOCKED" ? "text-red-700" : "text-gray-900"}`}>
              {column.label}
            </h2>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === column.status)
                .map((task) => (
                  <TaskCard key={task.id} task={task} projectId={projectId} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
