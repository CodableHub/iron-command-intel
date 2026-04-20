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

export interface FleetStatusEntry {
  hull_number?: string;
  tail_number?: string;
  name?: string;
  variant?: string;
  commissioned?: string;
  home_port?: string;
  base?: string;
  status?: string;
  notes?: string;
}

export interface ModernizationProgram {
  program?: string;
  name?: string;
  status?: string;
  timeline?: string;
  description?: string;
  impact?: string;
}

export interface CuratedSource {
  title: string;
  type?: string;
  url?: string;
  relevance?: string;
  priority?: "essential" | "recommended" | "reference" | string;
}

export interface OperationalPatterns {
  typical_deployment?: string;
  deployment_length?: string;
  deployment_length_months?: number;
  key_operating_areas?: string[];
  operating_areas?: string;
  typical_task_group?: string;
  readiness_notes?: string;
}

export interface ICCoverage {
  title?: string;
  url?: string;
  youtube_id?: string;
  kind?: string;
  published?: string;
}

export interface NewsEntry {
  title: string;
  url: string;
  source?: string;
  published?: string;
  relevance_score?: number;
}

export interface Platform extends PlatformSummary {
  overview_md: string;
  specs_json: Record<string, any>;
  armament_json: ArmamentItem[];
  variants_json: Variant[];
  fleet_status_json: FleetStatusEntry[];
  builder: string | null;
  wiki_url: string | null;
  sources_json: any[];
  combat_history: CombatEvent[];
  modernization: ModernizationProgram[];
  vulnerabilities: Vulnerability[];
  operational_patterns: OperationalPatterns | null;
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
  curated_sources: CuratedSource[];
  news: NewsEntry[];
  ic_coverage?: ICCoverage[];
}

export const FLAG: Record<string, string> = {
  "United States": "\u{1F1FA}\u{1F1F8}", "Russia": "\u{1F1F7}\u{1F1FA}", "China": "\u{1F1E8}\u{1F1F3}",
  "United Kingdom": "\u{1F1EC}\u{1F1E7}", "Japan": "\u{1F1EF}\u{1F1F5}", "South Korea": "\u{1F1F0}\u{1F1F7}",
  "India": "\u{1F1EE}\u{1F1F3}", "France": "\u{1F1EB}\u{1F1F7}", "Germany": "\u{1F1E9}\u{1F1EA}", "Norway": "\u{1F1F3}\u{1F1F4}",
  "Iran": "\u{1F1EE}\u{1F1F7}", "North Korea": "\u{1F1F0}\u{1F1F5}", "Italy": "\u{1F1EE}\u{1F1F9}", "Turkey": "\u{1F1F9}\u{1F1F7}",
  "Australia": "\u{1F1E6}\u{1F1FA}", "Taiwan": "\u{1F1F9}\u{1F1FC}", "Soviet Union/Russia": "\u{1F1F7}\u{1F1FA}",
  "Sweden": "\u{1F1F8}\u{1F1EA}", "Netherlands": "\u{1F1F3}\u{1F1F1}", "Spain": "\u{1F1EA}\u{1F1F8}",
  "Canada": "\u{1F1E8}\u{1F1E6}", "Israel": "\u{1F1EE}\u{1F1F1}", "Greece": "\u{1F1EC}\u{1F1F7}",
  "Egypt": "\u{1F1EA}\u{1F1EC}", "Pakistan": "\u{1F1F5}\u{1F1F0}", "Indonesia": "\u{1F1EE}\u{1F1E9}",
  "Singapore": "\u{1F1F8}\u{1F1EC}", "Brazil": "\u{1F1E7}\u{1F1F7}", "Thailand": "\u{1F1F9}\u{1F1ED}",
  "Poland": "\u{1F1F5}\u{1F1F1}", "Vietnam": "\u{1F1FB}\u{1F1F3}", "Saudi Arabia": "\u{1F1F8}\u{1F1E6}",
  "UAE": "\u{1F1E6}\u{1F1EA}",
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
    cruiser: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    fighter: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    bomber: "text-red-400 bg-red-500/10 border-red-500/20",
    tank: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    apc: "text-lime-400 bg-lime-500/10 border-lime-500/20",
    artillery: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    helicopter: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  };
  return colors[type || ""] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
}

export function isNuclearPropulsion(propulsion?: string | null): boolean {
  if (!propulsion) return false;
  const p = propulsion.toLowerCase();
  return p.includes("nuclear") || p.includes("reactor") || /\bpwr\b/.test(p) || /\bs\d[a-z]?\b/.test(p);
}

// [lat, lon]
export const BASE_COORDS: Record<string, [number, number]> = {
  // US Navy
  "Groton, CT": [41.35, -72.08],
  "Groton": [41.35, -72.08],
  "Norfolk, VA": [36.95, -76.33],
  "Norfolk": [36.95, -76.33],
  "Pearl Harbor, HI": [21.35, -157.97],
  "Pearl Harbor": [21.35, -157.97],
  "Kitsap, WA": [47.72, -122.72],
  "Kitsap": [47.72, -122.72],
  "Bremerton, WA": [47.57, -122.63],
  "Bremerton": [47.57, -122.63],
  "San Diego, CA": [32.71, -117.16],
  "San Diego": [32.71, -117.16],
  "Yokosuka": [35.28, 139.67],
  "Yokosuka, Japan": [35.28, 139.67],
  "Sasebo": [33.17, 129.72],
  "Mayport, FL": [30.39, -81.41],
  "Mayport": [30.39, -81.41],
  "King's Bay, GA": [30.79, -81.52],
  "Kings Bay": [30.79, -81.52],
  "Everett, WA": [47.98, -122.22],
  "Guam": [13.44, 144.79],
  "Apra Harbor": [13.44, 144.79],
  "Bahrain": [26.22, 50.58],
  "Rota, Spain": [36.62, -6.35],
  "Diego Garcia": [-7.31, 72.41],
  // Royal Navy
  "Faslane": [56.06, -4.82],
  "HMNB Clyde": [56.06, -4.82],
  "HMNB Devonport": [50.38, -4.18],
  "Devonport": [50.38, -4.18],
  "HMNB Portsmouth": [50.80, -1.10],
  "Portsmouth": [50.80, -1.10],
  // French Navy
  "Toulon": [43.12, 5.93],
  "Brest": [48.39, -4.49],
  "Île Longue": [48.31, -4.58],
  // Russian Navy
  "Severomorsk": [69.07, 33.42],
  "Vladivostok": [43.12, 131.89],
  "Petropavlovsk-Kamchatsky": [53.02, 158.65],
  "Sevastopol": [44.62, 33.52],
  "Baltiysk": [54.65, 19.90],
  "Polyarny": [69.20, 33.44],
  "Gadzhiyevo": [69.25, 33.33],
  // PLA Navy
  "Qingdao": [36.07, 120.38],
  "Zhanjiang": [21.27, 110.36],
  "Sanya": [18.25, 109.50],
  "Yulin": [18.22, 109.70],
  "Ningbo": [29.87, 121.54],
  "Dalian": [38.92, 121.63],
  // JMSDF
  "Yokosuka (JMSDF)": [35.29, 139.67],
  "Kure": [34.24, 132.55],
  "Maizuru": [35.48, 135.38],
  "Sasebo (JMSDF)": [33.17, 129.72],
  // ROK Navy
  "Busan": [35.10, 129.04],
  "Jinhae": [35.15, 128.70],
  // Indian Navy
  "Mumbai": [18.93, 72.83],
  "Visakhapatnam": [17.69, 83.21],
  "Karwar": [14.82, 74.12],
  // Australian Navy
  "Garden Island, WA": [-32.24, 115.68],
  "HMAS Stirling": [-32.24, 115.68],
  "HMAS Kuttabul": [-33.85, 151.22],
  "Sydney": [-33.85, 151.22],
  // German Navy
  "Kiel": [54.33, 10.13],
  "Wilhelmshaven": [53.53, 8.14],
  // Italian Navy
  "La Spezia": [44.10, 9.82],
  "Taranto": [40.48, 17.23],
  // Turkish Navy
  "Aksaz": [36.85, 28.47],
  "Gölcük": [40.72, 29.83],
  // Iranian Navy
  "Bandar Abbas": [27.19, 56.28],
  // North Korean Navy
  "Sinpo": [40.04, 128.18],
  // Israeli Navy
  "Haifa": [32.82, 34.99],
  // Spanish Navy
  "Cartagena": [37.60, -0.98],
  "Rota": [36.62, -6.35],
  // Others
  "Cadiz": [36.53, -6.30],
  "Bergen": [60.39, 5.32],
  "Haakonsvern": [60.35, 5.22],
  "Den Helder": [52.95, 4.76],
  "Karlskrona": [56.16, 15.59],
  "Alexandria": [31.20, 29.92],
  "Karachi": [24.85, 66.98],
  "Surabaya": [-7.24, 112.74],
  "Changi": [1.38, 103.99],
  "Rio de Janeiro": [-22.91, -43.17],
  "Gdynia": [54.52, 18.54],
  "Cam Ranh": [11.90, 109.22],
  "Jeddah": [21.49, 39.19],
  "Abu Dhabi": [24.47, 54.37],
  // Air bases (for aircraft platforms)
  "Nellis AFB": [36.23, -115.03],
  "Edwards AFB": [34.91, -117.88],
  "Langley AFB": [37.08, -76.36],
  "Elmendorf AFB": [61.25, -149.80],
  "Tyndall AFB": [30.07, -85.58],
  "Kadena AB": [26.36, 127.77],
  "RAF Lakenheath": [52.41, 0.56],
  "RAF Marham": [52.65, 0.56],
  "RAF Waddington": [53.17, -0.52],
  "RAF Coningsby": [53.09, -0.17],
};

// [lat_min, lon_min, lat_max, lon_max]
export const AOR_COORDS: Record<string, [number, number, number, number]> = {
  "Western Pacific": [0, 120, 50, 180],
  "Pacific": [-10, 130, 55, -110],
  "South China Sea": [2, 102, 24, 122],
  "East China Sea": [24, 117, 34, 131],
  "Sea of Japan": [33, 128, 48, 142],
  "Yellow Sea": [32, 119, 40, 127],
  "Indian Ocean": [-30, 40, 25, 100],
  "Arabian Sea": [5, 55, 25, 78],
  "Arabian Gulf": [24, 48, 30, 57],
  "Persian Gulf": [24, 48, 30, 57],
  "Red Sea": [12, 33, 28, 44],
  "Gulf of Aden": [10, 43, 16, 52],
  "Mediterranean": [30, -5, 46, 37],
  "Mediterranean Sea": [30, -5, 46, 37],
  "Eastern Mediterranean": [30, 20, 40, 37],
  "Black Sea": [41, 28, 47, 42],
  "Baltic Sea": [53, 10, 66, 30],
  "North Sea": [51, -4, 61, 10],
  "Norwegian Sea": [62, -10, 75, 15],
  "Barents Sea": [70, 15, 82, 65],
  "Arctic": [70, -180, 90, 180],
  "Arctic Ocean": [70, -180, 90, 180],
  "North Atlantic": [35, -70, 65, 0],
  "Atlantic": [-10, -70, 60, 0],
  "South Atlantic": [-50, -60, 0, 20],
  "Caribbean": [10, -85, 25, -60],
  "Gulf of Mexico": [18, -97, 30, -80],
  "Western Atlantic": [20, -80, 50, -40],
  "Eastern Pacific": [0, -130, 50, -100],
  "Bay of Bengal": [5, 80, 22, 95],
  "Taiwan Strait": [22, 118, 26, 122],
  "Strait of Hormuz": [25, 54, 28, 58],
  "Strait of Malacca": [1, 98, 6, 104],
  "Sea of Okhotsk": [45, 135, 60, 160],
};
