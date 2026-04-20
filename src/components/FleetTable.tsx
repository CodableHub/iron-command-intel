"use client";

import { useMemo, useState } from "react";
import type { FleetStatusEntry } from "@/lib/types";

interface Props {
  fleet: FleetStatusEntry[];
}

export function FleetTable({ fleet }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: fleet.length };
    for (const h of fleet) {
      const s = (h.status || "unknown").toLowerCase();
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [fleet]);

  const statuses = useMemo(() => {
    const seen = new Set<string>();
    for (const h of fleet) seen.add((h.status || "unknown").toLowerCase());
    return Array.from(seen);
  }, [fleet]);

  const filtered = useMemo(() => {
    return fleet.filter((h) => {
      const st = (h.status || "unknown").toLowerCase();
      if (filter !== "all" && st !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = [h.hull_number, h.tail_number, h.name, h.variant, h.home_port, h.base]
          .filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [fleet, filter, search]);

  const statusColor = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "operational") return "bg-green-500/10 text-green-400";
    if (s === "building" || s === "construction" || s === "ordered") return "bg-blue-500/10 text-blue-400";
    if (s === "retired" || s === "decommissioned") return "bg-gray-500/10 text-gray-400";
    if (s === "reserve") return "bg-amber-500/10 text-amber-400";
    if (s === "lost" || s === "sunk") return "bg-red-500/10 text-red-400";
    return "bg-gray-500/10 text-gray-400";
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1 rounded transition-colors ${
            filter === "all" ? "bg-[#eac054] text-[#0a0f1a]" : "bg-[#0a0f1a] text-gray-400 hover:text-white"
          }`}>
          All ({statusCounts.all})
        </button>
        {statuses.sort().map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1 rounded capitalize transition-colors ${
              filter === s ? "bg-[#eac054] text-[#0a0f1a]" : "bg-[#0a0f1a] text-gray-400 hover:text-white"
            }`}>
            {s} ({statusCounts[s]})
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hull or port…"
          className="ml-auto text-xs px-3 py-1 bg-[#0a0f1a] border border-[#1e2a45] rounded text-gray-300
            placeholder-gray-600 focus:outline-none focus:border-[#48c0bf] min-w-[200px]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs uppercase border-b border-[#1e2a45]">
              <th className="pb-2 pr-3">Hull</th>
              <th className="pb-2 pr-3">Name</th>
              <th className="pb-2 pr-3">Variant</th>
              <th className="pb-2 pr-3">Commissioned</th>
              <th className="pb-2 pr-3">Home Port</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => (
              <tr key={i} className="border-b border-[#1e2a45]/40 hover:bg-[#0a0f1a]">
                <td className="py-2 pr-3 text-[#eac054] font-mono text-xs">
                  {h.hull_number || h.tail_number || "—"}
                </td>
                <td className="py-2 pr-3 text-white">{h.name || "—"}</td>
                <td className="py-2 pr-3 text-gray-400 text-xs">{h.variant || "—"}</td>
                <td className="py-2 pr-3 text-gray-400 text-xs font-mono">{h.commissioned || "—"}</td>
                <td className="py-2 pr-3 text-gray-400 text-xs">{h.home_port || h.base || "—"}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusColor(h.status)}`}>
                    {h.status || "—"}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-600 text-xs">
                  No hulls match filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
