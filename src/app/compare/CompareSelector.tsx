"use client";

import { useState, useMemo } from "react";
import { PlatformSummary, FLAG, formatCost } from "@/lib/types";
import Link from "next/link";

export function CompareSelector({ platforms }: { platforms: PlatformSummary[] }) {
  const [slugA, setSlugA] = useState("");
  const [slugB, setSlugB] = useState("");

  const grouped = useMemo(() => {
    const g: Record<string, PlatformSummary[]> = {};
    for (const p of platforms) {
      const c = p.country || "Other";
      if (!g[c]) g[c] = [];
      g[c].push(p);
    }
    return Object.entries(g).sort((a, b) => b[1].length - a[1].length);
  }, [platforms]);

  const pa = platforms.find((p) => p.slug === slugA);
  const pb = platforms.find((p) => p.slug === slugB);

  // Popular matchups
  const popular = [
    { a: "arleigh-burke-class", b: "type-055-renhai-class-destroyer", label: "Burke vs Type 055" },
    { a: "virginia-class-submarine", b: "yasen-class-submarine", label: "Virginia vs Yasen" },
    { a: "gerald-r-ford-class", b: "type-003-fujian", label: "Ford vs Fujian" },
    { a: "type-045-daring-class", b: "type-052d-luyang-iii", label: "Type 45 vs Type 052D" },
    { a: "astute-class-submarine", b: "virginia-class-submarine", label: "Astute vs Virginia" },
  ].filter(m => platforms.some(p => p.slug === m.a) && platforms.some(p => p.slug === m.b));

  return (
    <div>
      {/* Quick picks */}
      {popular.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Popular Comparisons</h3>
          <div className="flex flex-wrap gap-2">
            {popular.map((m) => (
              <button
                key={m.label}
                onClick={() => { setSlugA(m.a); setSlugB(m.b); }}
                className="px-3 py-1.5 bg-[#141b2d] border border-[#1e2a45] rounded-lg text-sm text-gray-300 hover:border-[#48c0bf]/30 hover:text-white transition-colors"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selectors */}
      <div className="flex items-end gap-4 flex-wrap mb-8">
        <div className="flex-1 min-w-[250px]">
          <label className="text-xs text-gray-500 uppercase mb-1 block">Platform A</label>
          <select
            value={slugA}
            onChange={(e) => setSlugA(e.target.value)}
            className="w-full bg-[#141b2d] border border-[#1e2a45] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#48c0bf]"
          >
            <option value="">Select platform...</option>
            {grouped.map(([country, plats]) => (
              <optgroup key={country} label={`${FLAG[country] || ""} ${country}`}>
                {plats.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} {p.designation ? `(${p.designation})` : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <span className="text-[#eac054] font-bold text-lg pb-2">VS</span>
        <div className="flex-1 min-w-[250px]">
          <label className="text-xs text-gray-500 uppercase mb-1 block">Platform B</label>
          <select
            value={slugB}
            onChange={(e) => setSlugB(e.target.value)}
            className="w-full bg-[#141b2d] border border-[#1e2a45] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#48c0bf]"
          >
            <option value="">Select platform...</option>
            {grouped.map(([country, plats]) => (
              <optgroup key={country} label={`${FLAG[country] || ""} ${country}`}>
                {plats.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name} {p.designation ? `(${p.designation})` : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison preview */}
      {pa && pb && (
        <div className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              {pa.image_url && <img src={pa.image_url} alt={pa.name} className="w-full h-32 object-cover rounded-lg mb-2" />}
              <h3 className="text-white font-semibold text-sm">{pa.name}</h3>
              <p className="text-gray-500 text-xs">{FLAG[pa.country || ""] || ""} {pa.country}</p>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-[#eac054] font-[family-name:var(--font-montserrat)] font-black text-4xl">VS</span>
            </div>
            <div className="text-center">
              {pb.image_url && <img src={pb.image_url} alt={pb.name} className="w-full h-32 object-cover rounded-lg mb-2" />}
              <h3 className="text-white font-semibold text-sm">{pb.name}</h3>
              <p className="text-gray-500 text-xs">{FLAG[pb.country || ""] || ""} {pb.country}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { label: "Displacement", a: pa.displacement_tonnes ? `${pa.displacement_tonnes.toLocaleString()}t` : "?", b: pb.displacement_tonnes ? `${pb.displacement_tonnes.toLocaleString()}t` : "?" },
              { label: "VLS Cells", a: pa.vls_cells?.toString() || "?", b: pb.vls_cells?.toString() || "?" },
              { label: "Units", a: pa.unit_count?.toString() || "?", b: pb.unit_count?.toString() || "?" },
              { label: "Cost", a: formatCost(pa.cost_usd), b: formatCost(pb.cost_usd) },
            ].map((row) => (
              <div key={row.label} className="text-center bg-[#0a0f1a] rounded-lg p-2">
                <div className="text-gray-500 text-[10px] uppercase mb-1">{row.label}</div>
                <div className="text-blue-400 text-sm font-bold">{row.a}</div>
                <div className="text-gray-600 text-[10px]">vs</div>
                <div className="text-red-400 text-sm font-bold">{row.b}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href={`/platforms/${pa.slug}`}
              className="px-4 py-2 border border-blue-500/30 text-blue-400 rounded-lg text-sm hover:bg-blue-500/10 transition-colors"
            >
              View {pa.name.split("-class")[0].split(" class")[0]}
            </Link>
            <Link
              href={`/platforms/${pb.slug}`}
              className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
            >
              View {pb.name.split("-class")[0].split(" class")[0]}
            </Link>
          </div>

          <div className="mt-6 text-center">
            <a href="https://youtube.com/@IronCommandSITREP" target="_blank" rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-red-400 transition-colors">
              Watch the full video comparison on YouTube →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
