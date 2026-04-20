import type { Platform } from "@/lib/types";

interface TimelineEvent {
  year: number;
  label: string;
  kind: "commission" | "variant" | "combat" | "modernization" | "future";
  detail?: string;
}

function extractYear(s?: string | null): number | null {
  if (!s) return null;
  const m = String(s).match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0], 10) : null;
}

export function PlatformTimeline({ p }: { p: Platform }) {
  const events: TimelineEvent[] = [];

  const firstYear = extractYear(p.first_commissioned);
  if (firstYear) {
    events.push({ year: firstYear, label: "First commissioned", kind: "commission", detail: p.first_commissioned || "" });
  }

  for (const v of p.variants_json || []) {
    const y = extractYear(v.years);
    if (y) events.push({ year: y, label: `${v.name}`, kind: "variant", detail: v.key_changes });
  }

  for (const c of p.combat_history || []) {
    const y = extractYear(c.date);
    if (y) events.push({ year: y, label: c.operation || "Combat event", kind: "combat", detail: c.event });
  }

  for (const m of p.modernization || []) {
    const y = extractYear(m.timeline);
    if (y) events.push({ year: y, label: m.program || m.name || "Modernization", kind: "modernization", detail: m.description });
  }

  if (events.length < 2) return null;

  events.sort((a, b) => a.year - b.year);
  const minYear = events[0].year;
  const maxYear = Math.max(events[events.length - 1].year, new Date().getFullYear() + 2);
  const span = Math.max(1, maxYear - minYear);

  const kindColor: Record<TimelineEvent["kind"], string> = {
    commission: "bg-[#eac054] border-[#eac054]",
    variant: "bg-[#48c0bf] border-[#48c0bf]",
    combat: "bg-red-500 border-red-500",
    modernization: "bg-purple-400 border-purple-400",
    future: "bg-gray-500 border-gray-500",
  };

  // Pick gridline years
  const decadeStart = Math.floor(minYear / 5) * 5;
  const gridYears: number[] = [];
  for (let y = decadeStart; y <= maxYear; y += 5) gridYears.push(y);

  const xPct = (year: number) => ((year - minYear) / span) * 100;

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#eac054]" />Commission</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#48c0bf]" />Variant</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Combat use</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" />Modernization</span>
      </div>

      <div className="relative bg-[#0a0f1a] rounded-lg p-6 pt-10 pb-20 overflow-hidden">
        {/* Timeline bar */}
        <div className="relative h-[2px] bg-[#1e2a45] mx-4">
          {gridYears.map((y) => (
            <div key={y} className="absolute top-[-4px]" style={{ left: `${xPct(y)}%` }}>
              <div className="w-px h-[10px] bg-[#1e2a45]" />
              <div className="text-[10px] text-gray-600 font-mono mt-1 -translate-x-1/2">{y}</div>
            </div>
          ))}

          {/* Event markers */}
          {events.map((e, i) => {
            // Stagger vertical position to avoid label overlap
            const laneCount = 4;
            const lane = i % laneCount;
            const yOffset = 18 + lane * 14;
            return (
              <div key={i} className="absolute top-0" style={{ left: `${xPct(e.year)}%` }}>
                <div className={`w-2.5 h-2.5 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 ${kindColor[e.kind]}`} />
                <div className="absolute -translate-x-1/2 whitespace-nowrap" style={{ top: `${yOffset}px` }}>
                  <div className="text-[10px] text-gray-400 font-mono">{e.year}</div>
                  <div className="text-[11px] text-gray-200 max-w-[140px] truncate">{e.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
