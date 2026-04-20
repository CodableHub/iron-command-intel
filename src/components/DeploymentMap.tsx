import { BASE_COORDS, AOR_COORDS } from "@/lib/types";
import type { FleetStatusEntry } from "@/lib/types";

interface Props {
  fleet?: FleetStatusEntry[];
  aors?: string[];
  fallbackHomePort?: string | null;
}

// Equirectangular projection to 1000x500 viewBox
const W = 1000;
const H = 500;
const projX = (lon: number) => ((lon + 180) / 360) * W;
const projY = (lat: number) => ((90 - lat) / 180) * H;

function normalizePort(port?: string): string | null {
  if (!port) return null;
  const clean = port.trim();
  if (clean === "TBD" || clean === "—" || clean === "") return null;
  return clean;
}

export function DeploymentMap({ fleet, aors, fallbackHomePort }: Props) {
  // Aggregate home ports with hull counts
  const portCounts = new Map<string, { count: number; hulls: string[] }>();
  if (fleet && fleet.length > 0) {
    for (const entry of fleet) {
      const port = normalizePort(entry.home_port || entry.base);
      if (!port) continue;
      const existing = portCounts.get(port) || { count: 0, hulls: [] };
      existing.count += 1;
      if (entry.hull_number || entry.name) {
        existing.hulls.push(entry.hull_number || entry.name || "");
      }
      portCounts.set(port, existing);
    }
  } else if (fallbackHomePort) {
    portCounts.set(fallbackHomePort, { count: 1, hulls: [] });
  }

  // Resolve coords
  const portDots: { port: string; lat: number; lon: number; count: number; hulls: string[] }[] = [];
  const unresolvedPorts: { port: string; count: number }[] = [];
  for (const [port, data] of portCounts) {
    const coords = BASE_COORDS[port] || BASE_COORDS[port.split(",")[0].trim()];
    if (coords) {
      portDots.push({ port, lat: coords[0], lon: coords[1], count: data.count, hulls: data.hulls });
    } else {
      unresolvedPorts.push({ port, count: data.count });
    }
  }

  // Resolve AORs
  const aorBoxes: { name: string; box: [number, number, number, number] }[] = [];
  const unresolvedAors: string[] = [];
  if (aors) {
    for (const aor of aors) {
      const box = AOR_COORDS[aor] || AOR_COORDS[aor.trim()];
      if (box) aorBoxes.push({ name: aor, box });
      else unresolvedAors.push(aor);
    }
  }

  if (portDots.length === 0 && aorBoxes.length === 0 && unresolvedPorts.length === 0 && unresolvedAors.length === 0) {
    return null;
  }

  const maxCount = Math.max(1, ...portDots.map((d) => d.count));
  const dotRadius = (c: number) => 4 + Math.round((c / maxCount) * 10);

  return (
    <div className="space-y-4">
      <div className="relative bg-[#050810] rounded-lg overflow-hidden border border-[#1e2a45]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="Deployment map">
          {/* Ocean fill */}
          <rect x="0" y="0" width={W} height={H} fill="#0a1628" />

          {/* Continents — simplified hand-drawn polygons */}
          <g fill="#10223a" stroke="#1e3a5f" strokeWidth="0.5">
            {/* North America */}
            <path d="M 50,70 L 140,50 L 210,55 L 260,80 L 280,120 L 310,150 L 290,180 L 260,200 L 230,210 L 210,230 L 170,240 L 150,220 L 120,210 L 90,180 L 70,140 Z" />
            {/* Central America */}
            <path d="M 230,220 L 260,240 L 270,260 L 260,275 L 245,268 L 235,250 Z" />
            {/* South America */}
            <path d="M 280,270 L 320,275 L 340,310 L 335,360 L 315,410 L 285,430 L 270,400 L 265,350 L 275,300 Z" />
            {/* Greenland */}
            <path d="M 440,40 L 470,35 L 490,55 L 485,85 L 465,95 L 445,80 L 438,60 Z" />
            {/* Europe */}
            <path d="M 470,100 L 520,90 L 560,95 L 580,115 L 570,145 L 545,160 L 510,155 L 485,140 L 470,120 Z" />
            {/* Africa */}
            <path d="M 490,170 L 540,165 L 580,180 L 595,220 L 600,260 L 580,310 L 555,340 L 525,350 L 505,320 L 495,275 L 485,230 L 480,195 Z" />
            {/* Middle East */}
            <path d="M 580,170 L 625,165 L 650,185 L 660,210 L 640,225 L 610,220 L 590,200 Z" />
            {/* Asia */}
            <path d="M 580,90 L 640,75 L 720,70 L 800,80 L 870,100 L 900,140 L 895,175 L 870,200 L 830,215 L 790,210 L 750,200 L 720,190 L 690,180 L 670,160 L 650,140 L 620,130 L 595,115 Z" />
            {/* India */}
            <path d="M 680,200 L 710,195 L 720,225 L 705,255 L 690,250 L 680,230 Z" />
            {/* SE Asia */}
            <path d="M 770,215 L 815,220 L 840,245 L 830,270 L 800,275 L 780,260 L 772,235 Z" />
            {/* Japan */}
            <path d="M 870,155 L 890,150 L 905,170 L 898,185 L 880,180 L 872,170 Z" />
            {/* Australia */}
            <path d="M 810,310 L 880,305 L 910,330 L 905,360 L 870,380 L 830,375 L 800,355 L 795,330 Z" />
            {/* UK/Ireland */}
            <path d="M 475,115 L 488,108 L 492,125 L 482,135 L 472,128 Z" />
          </g>

          {/* Graticule */}
          <g stroke="#1a2840" strokeWidth="0.5" fill="none" opacity="0.6">
            {[-60, -30, 0, 30, 60].map((lat) => (
              <line key={`lat-${lat}`} x1="0" x2={W} y1={projY(lat)} y2={projY(lat)} />
            ))}
            {[-120, -60, 0, 60, 120].map((lon) => (
              <line key={`lon-${lon}`} x1={projX(lon)} x2={projX(lon)} y1="0" y2={H} />
            ))}
          </g>

          {/* Equator label */}
          <text x="5" y={projY(0) - 3} fill="#2a4060" fontSize="9" fontFamily="monospace">EQUATOR</text>

          {/* AOR boxes */}
          {aorBoxes.map(({ name, box }) => {
            const [latMin, lonMin, latMax, lonMax] = box;
            // Handle dateline-crossing boxes
            let x = projX(lonMin);
            let width = projX(lonMax) - projX(lonMin);
            if (width < 0) width = W - x;
            const y = projY(latMax);
            const height = projY(latMin) - projY(latMax);
            return (
              <g key={name}>
                <rect x={x} y={y} width={width} height={height}
                  fill="#48c0bf" fillOpacity="0.08" stroke="#48c0bf" strokeOpacity="0.35" strokeWidth="1"
                  strokeDasharray="3,2" />
                <text x={x + width / 2} y={y + height / 2} fill="#48c0bf" fontSize="10"
                  fontFamily="monospace" textAnchor="middle" opacity="0.75"
                  style={{ pointerEvents: "none" }}>{name.toUpperCase()}</text>
              </g>
            );
          })}

          {/* Port dots */}
          {portDots.map((d) => {
            const cx = projX(d.lon);
            const cy = projY(d.lat);
            const r = dotRadius(d.count);
            return (
              <g key={d.port}>
                <circle cx={cx} cy={cy} r={r + 4} fill="#eac054" fillOpacity="0.15" />
                <circle cx={cx} cy={cy} r={r} fill="#eac054" stroke="#0a0f1a" strokeWidth="1.5" />
                {d.count > 1 && (
                  <text x={cx} y={cy + 3} fill="#0a0f1a" fontSize={Math.max(9, r)} fontWeight="bold"
                    textAnchor="middle" fontFamily="monospace">{d.count}</text>
                )}
                <text x={cx} y={cy - r - 4} fill="#eac054" fontSize="9" fontFamily="monospace"
                  textAnchor="middle" stroke="#0a0f1a" strokeWidth="2" paintOrder="stroke"
                  style={{ pointerEvents: "none" }}>{d.port.split(",")[0]}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend + unresolved list */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        {portDots.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#eac054]" />
            <span>Home ports {portDots.length > 0 && `(${portDots.reduce((s, d) => s + d.count, 0)} hulls)`}</span>
          </div>
        )}
        {aorBoxes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 border border-[#48c0bf]/60 bg-[#48c0bf]/10" style={{ borderStyle: "dashed" }} />
            <span>Typical operating areas</span>
          </div>
        )}
        {unresolvedPorts.length > 0 && (
          <div className="text-gray-600">
            Unmapped: {unresolvedPorts.map((p) => `${p.port} (${p.count})`).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
