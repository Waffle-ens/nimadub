"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="w-64 bg-gray-900 text-white h-screen overflow-y-auto fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Nimadub</h1>
        <p className="text-gray-400 text-sm mt-1">Dev Ops Console</p>
      </div>

      <nav className="mt-8">
        <Link
          href="/projects"
          className={`block px-6 py-3 ${
            isActive("/projects")
              ? "bg-blue-600 border-l-4 border-blue-400"
              : "hover:bg-gray-800"
          }`}
        >
          Projects
        </Link>
        <Link
          href="/documents"
          className={`block px-6 py-3 ${
            isActive("/documents")
              ? "bg-blue-600 border-l-4 border-blue-400"
              : "hover:bg-gray-800"
          }`}
        >
          Documents
        </Link>
        <Link
          href="/approvals"
          className={`block px-6 py-3 ${
            isActive("/approvals")
              ? "bg-blue-600 border-l-4 border-blue-400"
              : "hover:bg-gray-800"
          }`}
        >
          Approvals
        </Link>
        <Link
          href="/audit-logs"
          className={`block px-6 py-3 ${
            isActive("/audit-logs")
              ? "bg-blue-600 border-l-4 border-blue-400"
              : "hover:bg-gray-800"
          }`}
        >
          Audit Logs
        </Link>
      </nav>
    </div>
  );
}
