import { readFile, readdir } from "fs/promises";
import path from "path";
import { cache } from "react";

export type { PlatformSummary, Platform } from "./types";
export { FLAG, formatCost, getTypeColor } from "./types";

import type { PlatformSummary, Platform } from "./types";

const DATA_DIR = process.env.WIKI_DATA_DIR || path.join(process.cwd(), "data", "wiki");

export const getPlatforms = cache(async (): Promise<PlatformSummary[]> => {
  const filePath = path.join(DATA_DIR, "platforms.json");
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data);
});

// Name -> slug index for resolving peer comparisons
export const getSlugIndex = cache(async (): Promise<Map<string, string>> => {
  const platforms = await getPlatforms();
  const index = new Map<string, string>();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  for (const p of platforms) {
    index.set(norm(p.name), p.slug);
    index.set(norm(p.slug.replace(/-/g, " ")), p.slug);
    if (p.designation) index.set(norm(p.designation), p.slug);
    // Strip "-class", "Class" suffixes for partial matches
    const short = p.name.replace(/[-\s]class(\s+\w+)?$/i, "").trim();
    if (short && short !== p.name) index.set(norm(short), p.slug);
  }
  return index;
});

// Generic tokens that match too much — ignored for overlap scoring
const STOPWORDS = new Set([
  "class", "type", "submarine", "submarines", "frigate", "destroyer", "cruiser",
  "carrier", "corvette", "amphibious", "aircraft", "fighter", "bomber", "tank",
  "helicopter", "ship", "boat", "nuclear", "attack", "strategic",
]);

function isDistinctive(tok: string): boolean {
  // Numeric/model codes are highly distinctive
  if (/\d/.test(tok)) return true;
  return tok.length > 3 && !STOPWORDS.has(tok);
}

export async function resolvePeerSlug(peerName: string): Promise<string | null> {
  const index = await getSlugIndex();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const key = norm(peerName);
  if (index.has(key)) return index.get(key)!;

  // Prefix match — require the shared prefix to contain a distinctive token
  for (const [k, v] of index) {
    if (k.length < 5) continue;
    if (!(key.startsWith(k) || k.startsWith(key))) continue;
    const shared = (key.startsWith(k) ? k : key).split(" ");
    if (shared.some(isDistinctive)) return v;
  }

  // Distinctive-token overlap
  const keyDistinct = new Set(key.split(" ").filter(isDistinctive));
  if (keyDistinct.size === 0) return null;
  let best: { slug: string; score: number } | null = null;
  for (const [k, v] of index) {
    const tokens = k.split(" ").filter(isDistinctive);
    if (tokens.length === 0) continue;
    const overlap = tokens.filter((t) => keyDistinct.has(t)).length;
    if (overlap === 0) continue;
    if (!best || overlap > best.score) best = { slug: v, score: overlap };
  }
  return best?.slug || null;
}

export const getPlatform = cache(async (slug: string): Promise<Platform | null> => {
  try {
    const filePath = path.join(DATA_DIR, `${slug}.json`);
    const base = JSON.parse(await readFile(filePath, "utf-8"));

    // Merge extended data if available
    try {
      const extPath = path.join(DATA_DIR, `${slug}_extended.json`);
      const ext = JSON.parse(await readFile(extPath, "utf-8"));
      for (const key of Object.keys(ext)) {
        const baseVal = base[key];
        const extVal = ext[key];
        if (extVal == null) continue;
        if (baseVal == null || baseVal === "" || (Array.isArray(baseVal) && baseVal.length === 0)) {
          base[key] = extVal;
        } else if (Array.isArray(baseVal) && Array.isArray(extVal) && extVal.length > baseVal.length) {
          base[key] = extVal;
        }
      }
    } catch {
      // No extended file — that's fine
    }

    return base;
  } catch {
    // No base file — try extended as fallback
    try {
      const extPath = path.join(DATA_DIR, `${slug}_extended.json`);
      const ext = JSON.parse(await readFile(extPath, "utf-8"));
      return ext;
    } catch {
      return null;
    }
  }
});

export async function getAllSlugs(): Promise<string[]> {
  const platforms = await getPlatforms();
  return platforms.map((p) => p.slug);
}

// Fleet deployments
export interface FleetDeployment {
  last_updated: string;
  summary: { total_carriers: number; deployed: number; in_port: number; maintenance: number };
  carriers: Record<string, any>;
  regions: Record<string, any>;
  sources: any[];
}

export async function getFleetDeployments(): Promise<FleetDeployment | null> {
  try {
    const data = await readFile(path.join(DATA_DIR, "fleet_deployments.json"), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// News across all platforms
export interface NewsItem {
  title: string;
  url: string;
  source?: string;
  published?: string;
  relevance_score?: number;
  platform_slug?: string;
  platform_name?: string;
}

export async function getRecentNews(limit = 20): Promise<NewsItem[]> {
  const files = await readdir(DATA_DIR);
  const allNews: NewsItem[] = [];

  for (const file of files) {
    if (!file.endsWith(".json") || file.endsWith("_extended.json") || file === "platforms.json" || file === "fleet_deployments.json") continue;
    try {
      const data = JSON.parse(await readFile(path.join(DATA_DIR, file), "utf-8"));
      if (data.news && Array.isArray(data.news)) {
        for (const n of data.news) {
          allNews.push({ ...n, platform_slug: data.slug, platform_name: data.name });
        }
      }
    } catch { /* skip bad files */ }
  }

  // Sort by published date descending, dedupe by URL
  const seen = new Set<string>();
  return allNews
    .sort((a, b) => (b.published || "").localeCompare(a.published || ""))
    .filter((n) => {
      if (seen.has(n.url)) return false;
      seen.add(n.url);
      return true;
    })
    .slice(0, limit);
}

// Matchup scoring
export interface Matchup {
  a: PlatformSummary;
  b: PlatformSummary;
  score: number;
  reasons: string[];
  done: boolean;
}

const DONE_MATCHUPS = new Set([
  "arleigh-burke-class|type-055-renhai-class-destroyer",
]);

export async function getMatchups(limit = 50): Promise<Matchup[]> {
  const platforms = await getPlatforms();
  const matchups: Matchup[] = [];
  const majorNavies = new Set(["United States", "China", "Russia", "United Kingdom", "Japan", "France", "India"]);

  for (let i = 0; i < platforms.length; i++) {
    for (let j = i + 1; j < platforms.length; j++) {
      const a = platforms[i];
      const b = platforms[j];
      if (!a.type || !b.type || a.type !== b.type) continue;
      if (a.country === b.country) continue;

      let score = 0;
      const reasons: string[] = [];

      // VLS data
      if (a.vls_cells && a.vls_cells > 0) score += 3;
      if (b.vls_cells && b.vls_cells > 0) score += 3;

      // Displacement data
      if (a.displacement_tonnes) score += 2;
      if (b.displacement_tonnes) score += 2;

      // Similar size
      if (a.displacement_tonnes && b.displacement_tonnes) {
        const ratio = Math.max(a.displacement_tonnes, b.displacement_tonnes) / Math.min(a.displacement_tonnes, b.displacement_tonnes);
        if (ratio < 2) { score += 3; reasons.push("Similar size"); }
        else if (ratio < 3) { score += 1; }
      }

      // Geopolitical interest
      const pair = [a.country, b.country].sort().join(" vs ");
      if (pair.includes("United States") && pair.includes("China")) { score += 5; reasons.push("US vs China"); }
      else if (pair.includes("United States") && pair.includes("Russia")) { score += 4; reasons.push("US vs Russia"); }
      else if (pair.includes("China") && pair.includes("Russia")) { score += 3; reasons.push("China vs Russia"); }

      // Major navies
      if (majorNavies.has(a.country || "")) score += 2;
      if (majorNavies.has(b.country || "")) score += 2;

      // Unit count (more units = more relevant)
      if ((a.unit_count || 0) > 5) score += 1;
      if ((b.unit_count || 0) > 5) score += 1;

      const key = [a.slug, b.slug].sort().join("|");
      const done = DONE_MATCHUPS.has(key);
      if (done) reasons.push("Video published");

      if (score >= 8) {
        matchups.push({ a, b, score, reasons, done });
      }
    }
  }

  return matchups.sort((a, b) => b.score - a.score).slice(0, limit);
}

// Full comparison data
export interface ComparisonData {
  a: Platform;
  b: Platform;
  specsBars: { label: string; aVal: number; bVal: number; unit: string }[];
}

export async function getComparison(slugA: string, slugB: string): Promise<ComparisonData | null> {
  const a = await getPlatform(slugA);
  const b = await getPlatform(slugB);
  if (!a || !b) return null;

  const specsBars: ComparisonData["specsBars"] = [];
  const specPairs = [
    { key: "displacement_tonnes", label: "Displacement", unit: "t" },
    { key: "length_m", label: "Length", unit: "m" },
    { key: "beam_m", label: "Beam", unit: "m" },
    { key: "speed_knots", label: "Speed", unit: "kts" },
    { key: "range_nm", label: "Range", unit: "nm" },
    { key: "crew", label: "Crew", unit: "" },
  ];

  for (const { key, label, unit } of specPairs) {
    const aVal = Number(a.specs_json?.[key]) || 0;
    const bVal = Number(b.specs_json?.[key]) || 0;
    if (aVal > 0 || bVal > 0) {
      specsBars.push({ label, aVal, bVal, unit });
    }
  }

  // VLS cells from summary
  if ((a.vls_cells || 0) > 0 || (b.vls_cells || 0) > 0) {
    specsBars.push({ label: "VLS Cells", aVal: a.vls_cells || 0, bVal: b.vls_cells || 0, unit: "" });
  }

  return { a, b, specsBars };
}
