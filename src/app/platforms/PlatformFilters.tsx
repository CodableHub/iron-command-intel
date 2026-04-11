"use client";

import { useState, useMemo } from "react";
import { PlatformSummary, FLAG } from "@/lib/types";
import { PlatformCard } from "@/components/PlatformCard";

export function PlatformFilters({
  platforms,
  types,
  countries,
}: {
  platforms: PlatformSummary[];
  types: string[];
  countries: string[];
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return platforms.filter((p) => {
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (countryFilter !== "all" && p.country !== countryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.designation || "").toLowerCase().includes(q) ||
          (p.country || "").toLowerCase().includes(q) ||
          p.comparison_tags.some((t) => t.includes(q))
        );
      }
      return true;
    });
  }, [platforms, typeFilter, countryFilter, search]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search platforms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-[#141b2d] border border-[#1e2a45] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#48c0bf] w-64"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-[#141b2d] border border-[#1e2a45] rounded-lg text-sm text-white focus:outline-none focus:border-[#48c0bf]"
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-3 py-2 bg-[#141b2d] border border-[#1e2a45] rounded-lg text-sm text-white focus:outline-none focus:border-[#48c0bf]"
        >
          <option value="all">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {FLAG[c] || ""} {c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} platforms</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => (
          <PlatformCard key={p.slug} platform={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">No platforms match your filters.</p>
      )}
    </div>
  );
}
