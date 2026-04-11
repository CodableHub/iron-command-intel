export interface PlatformSummary {
  slug: string;
  name: string;
  designation: string | null;
  type: string | null;
  country: string | null;
  operator: string | null;
  unit_count: number | null;
  cost_usd: number | null;
  image_url: string | null;
  first_commissioned: string | null;
  displacement_tonnes: number | null;
  vls_cells: number | null;
  updated_at: string | null;
  comparison_tags: string[];
}

export interface ArmamentItem {
  category: string;
  name: string;
  type?: string;
  quantity?: string;
  range_km?: number;
  notes?: string;
}

export interface Variant {
  name: string;
  designation_range?: string;
  years?: string;
  count?: number;
  key_changes?: string;
  status?: string;
}

export interface CombatEvent {
  date?: string;
  operation?: string;
  event?: string;
  significance?: string;
}

export interface Vulnerability {
  area: string;
  description: string;
  context?: string;
  mitigation?: string;
}

export interface PeerComparison {
  platform: string;
  country: string;
  relationship: string;
  key_differences: string;
  video_angle?: string;
}

export interface Platform extends PlatformSummary {
  overview_md: string;
  specs_json: Record<string, any>;
  armament_json: ArmamentItem[];
  variants_json: Variant[];
  fleet_status_json: any[];
  builder: string | null;
  wiki_url: string | null;
  sources_json: any[];
  combat_history: CombatEvent[];
  modernization: any[];
  vulnerabilities: Vulnerability[];
  operational_patterns: Record<string, any> | null;
  peer_comparisons: PeerComparison[];
  search_keywords: string[];
  images: any[];
  doctrine: {
    role?: string;
    employment?: string;
    design_philosophy?: string;
    threat_context?: string;
    comparison_frame?: string;
  } | null;
  curated_sources: any[];
  news: any[];
}

export const FLAG: Record<string, string> = {
  "United States": "\u{1F1FA}\u{1F1F8}", "Russia": "\u{1F1F7}\u{1F1FA}", "China": "\u{1F1E8}\u{1F1F3}",
  "United Kingdom": "\u{1F1EC}\u{1F1E7}", "Japan": "\u{1F1EF}\u{1F1F5}", "South Korea": "\u{1F1F0}\u{1F1F7}",
  "India": "\u{1F1EE}\u{1F1F3}", "France": "\u{1F1EB}\u{1F1F7}", "Germany": "\u{1F1E9}\u{1F1EA}", "Norway": "\u{1F1F3}\u{1F1F4}",
  "Iran": "\u{1F1EE}\u{1F1F7}", "North Korea": "\u{1F1F0}\u{1F1F5}", "Italy": "\u{1F1EE}\u{1F1F9}", "Turkey": "\u{1F1F9}\u{1F1F7}",
  "Australia": "\u{1F1E6}\u{1F1FA}", "Taiwan": "\u{1F1F9}\u{1F1FC}", "Soviet Union/Russia": "\u{1F1F7}\u{1F1FA}",
};

export function formatCost(usd: number | null): string {
  if (!usd) return "\u2014";
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`;
  return `$${usd.toLocaleString()}`;
}

export function getTypeColor(type: string | null): string {
  const colors: Record<string, string> = {
    destroyer: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    submarine: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    carrier: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    frigate: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    corvette: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    amphibious: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };
  return colors[type || ""] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
}
