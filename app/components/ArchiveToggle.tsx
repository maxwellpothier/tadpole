"use client";

import { Archive } from "lucide-react";

interface ArchiveToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function ArchiveToggle({
  checked,
  onChange,
}: ArchiveToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${
          checked
            ? "bg-gray-900 text-white"
            : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
        }
      `}
    >
      <Archive size={16} />
      {checked ? "Showing Archived" : "Show Archived"}
    </button>
  );
}
