"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PlatformSummary, FLAG, formatCost } from "@/lib/types";
import Link from "next/link";

interface SpecBar {
  label: string;
  aVal: number;
  bVal: number;
  unit: string;
}

interface FullPlatform extends PlatformSummary {
  specs_json?: Record<string, any>;
  armament_json?: { category: string; name: string; quantity?: string; range_km?: number; notes?: string }[];
  doctrine?: { role?: string; design_philosophy?: string; threat_context?: string; comparison_frame?: string } | null;
  vulnerabilities?: { area: string; description: string }[];
  peer_comparisons?: { platform: string; country: string; relationship: string; key_differences: string; video_angle?: string }[];
  combat_history?: { date?: string; operation?: string; event?: string; significance?: string }[];
  images?: { url: string; caption?: string }[];
  overview_md?: string;
}

function SpecBarRow({ label, aVal, bVal, unit }: SpecBar) {
  const max = Math.max(aVal, bVal, 1);
  const aW = (aVal / max) * 100;
  const bW = (bVal / max) * 100;
  const aWins = aVal > bVal;
  const bWins = bVal > aVal;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{aVal > 0 || bVal > 0 ? `${aVal.toLocaleString()}${unit} vs ${bVal.toLocaleString()}${unit}` : "—"}</span>
      </div>
      <div className="flex gap-1 h-5">
        <div className="flex-1 flex justify-end">
          <div
            className={`h-full rounded-l transition-all ${aWins ? "bg-blue-500" : "bg-blue-500/40"}`}
            style={{ width: `${aW}%` }}
          />
        </div>
        <div className="flex-1">
          <div
            className={`h-full rounded-r transition-all ${bWins ? "bg-red-500" : "bg-red-500/40"}`}
            style={{ width: `${bW}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function CompareSelector({ platforms }: { platforms: PlatformSummary[] }) {
  const searchParams = useSearchParams();
  const [slugA, setSlugA] = useState(searchParams.get("a") || "");
  const [slugB, setSlugB] = useState(searchParams.get("b") || "");
  const [fullA, setFullA] = useState<FullPlatform | null>(null);
  const [fullB, setFullB] = useState<FullPlatform | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Fetch full platform data when both selected
  useEffect(() => {
    if (!slugA || !slugB) { setFullA(null); setFullB(null); return; }
    setLoading(true);
    Promise.all([
      fetch(`/api/platform/${slugA}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/platform/${slugB}`).then(r => r.ok ? r.json() : null),
    ]).then(([a, b]) => {
      setFullA(a);
      setFullB(b);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slugA, slugB]);

  // Build spec bars from full data
  const specsBars: SpecBar[] = useMemo(() => {
    if (!fullA || !fullB) return [];
    const bars: SpecBar[] = [];
    const pairs = [
      { key: "displacement_tonnes", label: "Displacement", unit: "t" },
      { key: "length_m", label: "Length", unit: "m" },
      { key: "beam_m", label: "Beam", unit: "m" },
      { key: "speed_knots", label: "Speed", unit: "kts" },
      { key: "range_nm", label: "Range", unit: "nm" },
      { key: "crew", label: "Crew", unit: "" },
    ];
    for (const { key, label, unit } of pairs) {
      const aVal = Number(fullA.specs_json?.[key]) || 0;
      const bVal = Number(fullB.specs_json?.[key]) || 0;
      if (aVal > 0 || bVal > 0) bars.push({ label, aVal, bVal, unit });
    }
    if ((fullA.vls_cells || 0) > 0 || (fullB.vls_cells || 0) > 0) {
      bars.push({ label: "VLS Cells", aVal: fullA.vls_cells || 0, bVal: fullB.vls_cells || 0, unit: "" });
    }
    if ((fullA.unit_count || 0) > 0 || (fullB.unit_count || 0) > 0) {
      bars.push({ label: "In Service", aVal: fullA.unit_count || 0, bVal: fullB.unit_count || 0, unit: "" });
    }
    return bars;
  }, [fullA, fullB]);

  // Group armament by category
  const armamentCategories = useMemo(() => {
    if (!fullA || !fullB) return [];
    const cats = new Set<string>();
    (fullA.armament_json || []).forEach(a => cats.add(a.category));
    (fullB.armament_json || []).forEach(a => cats.add(a.category));
    return Array.from(cats);
  }, [fullA, fullB]);

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

      {/* Full Comparison */}
      {pa && pb && (
        <div className="space-y-6">
          {/* Header with images */}
          <div className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                {pa.image_url && <img src={pa.image_url} alt={pa.name} className="w-full h-36 object-cover rounded-lg mb-2" />}
                <h3 className="text-blue-400 font-bold text-lg">{pa.name}</h3>
                <p className="text-gray-500 text-sm">{FLAG[pa.country || ""] || ""} {pa.country}</p>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[#eac054] font-[family-name:var(--font-montserrat)] font-black text-5xl">VS</span>
              </div>
              <div className="text-center">
                {pb.image_url && <img src={pb.image_url} alt={pb.name} className="w-full h-36 object-cover rounded-lg mb-2" />}
                <h3 className="text-red-400 font-bold text-lg">{pb.name}</h3>
                <p className="text-gray-500 text-sm">{FLAG[pb.country || ""] || ""} {pb.country}</p>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Displacement", a: pa.displacement_tonnes ? `${pa.displacement_tonnes.toLocaleString()}t` : "—", b: pb.displacement_tonnes ? `${pb.displacement_tonnes.toLocaleString()}t` : "—" },
                { label: "VLS Cells", a: pa.vls_cells?.toString() || "—", b: pb.vls_cells?.toString() || "—" },
                { label: "In Service", a: pa.unit_count?.toString() || "—", b: pb.unit_count?.toString() || "—" },
                { label: "Cost/Hull", a: formatCost(pa.cost_usd), b: formatCost(pb.cost_usd) },
              ].map((row) => (
                <div key={row.label} className="text-center bg-[#0a0f1a] rounded-lg p-3">
                  <div className="text-gray-500 text-[10px] uppercase mb-1">{row.label}</div>
                  <div className="text-blue-400 text-sm font-bold">{row.a}</div>
                  <div className="text-gray-600 text-[10px]">vs</div>
                  <div className="text-red-400 text-sm font-bold">{row.b}</div>
                </div>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center text-gray-500 py-8">Loading full comparison data...</div>
          )}

          {/* Specs Bars */}
          {specsBars.length > 0 && (
            <div className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Specifications</h2>
              <div className="flex justify-between text-xs text-gray-600 mb-4">
                <span className="text-blue-400">{pa.name}</span>
                <span className="text-red-400">{pb.name}</span>
              </div>
              {specsBars.map((bar) => (
                <SpecBarRow key={bar.label} {...bar} />
              ))}
            </div>
          )}

          {/* Armament Comparison */}
          {armamentCategories.length > 0 && fullA && fullB && (
            <div className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Armament</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-blue-400 font-semibold text-sm mb-3">{pa.name}</h3>
                  {armamentCategories.map(cat => {
                    const items = (fullA.armament_json || []).filter(a => a.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat} className="mb-3">
                        <div className="text-xs text-gray-500 uppercase mb-1">{cat}</div>
                        {items.map((item, i) => (
                          <div key={i} className="text-sm text-gray-300 ml-2">
                            {item.quantity && <span className="text-blue-400 font-mono mr-1">{item.quantity}x</span>}
                            {item.name}
                            {item.range_km ? <span className="text-gray-600 ml-1">({item.range_km}km)</span> : null}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold text-sm mb-3">{pb.name}</h3>
                  {armamentCategories.map(cat => {
                    const items = (fullB.armament_json || []).filter(a => a.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat} className="mb-3">
                        <div className="text-xs text-gray-500 uppercase mb-1">{cat}</div>
                        {items.map((item, i) => (
                          <div key={i} className="text-sm text-gray-300 ml-2">
                            {item.quantity && <span className="text-red-400 font-mono mr-1">{item.quantity}x</span>}
                            {item.name}
                            {item.range_km ? <span className="text-gray-600 ml-1">({item.range_km}km)</span> : null}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Doctrine Comparison */}
          {fullA?.doctrine && fullB?.doctrine && (
            <div className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Doctrine & Employment</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-blue-400 font-semibold text-sm mb-2">{pa.name}</h3>
                  {fullA.doctrine.role && <p className="text-sm text-gray-300 mb-2"><span className="text-gray-500">Role:</span> {fullA.doctrine.role}</p>}
                  {fullA.doctrine.design_philosophy && <p className="text-sm text-gray-300 mb-2"><span className="text-gray-500">Philosophy:</span> {fullA.doctrine.design_philosophy}</p>}
                  {fullA.doctrine.threat_context && <p className="text-sm text-gray-400">{fullA.doctrine.threat_context}</p>}
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold text-sm mb-2">{pb.name}</h3>
                  {fullB.doctrine.role && <p className="text-sm text-gray-300 mb-2"><span className="text-gray-500">Role:</span> {fullB.doctrine.role}</p>}
                  {fullB.doctrine.design_philosophy && <p className="text-sm text-gray-300 mb-2"><span className="text-gray-500">Philosophy:</span> {fullB.doctrine.design_philosophy}</p>}
                  {fullB.doctrine.threat_context && <p className="text-sm text-gray-400">{fullB.doctrine.threat_context}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Vulnerabilities */}
          {((fullA?.vulnerabilities?.length || 0) > 0 || (fullB?.vulnerabilities?.length || 0) > 0) && (
            <div className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Known Vulnerabilities</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-blue-400 font-semibold text-sm mb-2">{pa.name}</h3>
                  {(fullA?.vulnerabilities || []).map((v, i) => (
                    <div key={i} className="mb-2">
                      <div className="text-xs text-amber-400 uppercase">{v.area}</div>
                      <div className="text-sm text-gray-400">{v.description}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold text-sm mb-2">{pb.name}</h3>
                  {(fullB?.vulnerabilities || []).map((v, i) => (
                    <div key={i} className="mb-2">
                      <div className="text-xs text-amber-400 uppercase">{v.area}</div>
                      <div className="text-sm text-gray-400">{v.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Platform links + YT CTA */}
          <div className="flex gap-3 justify-center pt-2">
            <Link href={`/platforms/${pa.slug}`} className="px-5 py-2.5 border border-blue-500/30 text-blue-400 rounded-lg text-sm hover:bg-blue-500/10 transition-colors">
              Full {pa.name.split("-class")[0].split(" class")[0]} Profile
            </Link>
            <a href="https://youtube.com/@ironcommandyt" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-500 transition-colors">
              Watch Video Comparisons
            </a>
            <Link href={`/platforms/${pb.slug}`} className="px-5 py-2.5 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-500/10 transition-colors">
              Full {pb.name.split("-class")[0].split(" class")[0]} Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
