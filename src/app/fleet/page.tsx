import { getFleetDeployments } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleet Tracker — US Carrier Deployments",
  description: "Track US Navy carrier strike group deployments worldwide. Current positions, air wings, and activity logs.",
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    deployed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "in port": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[status?.toLowerCase()] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
      {status}
    </span>
  );
}

export default async function FleetPage() {
  const fleet = await getFleetDeployments();

  if (!fleet) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Fleet Tracker</h1>
        <p className="text-gray-400">Fleet deployment data is currently unavailable.</p>
      </div>
    );
  }

  const carriers = Object.values(fleet.carriers || {}) as any[];
  const deployed = carriers.filter((c: any) => c.status?.toLowerCase() === "deployed");
  const inPort = carriers.filter((c: any) => c.status?.toLowerCase() === "in port");
  const maintenance = carriers.filter((c: any) => c.status?.toLowerCase() === "maintenance");
  const other = carriers.filter((c: any) => !["deployed", "in port", "maintenance"].includes(c.status?.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fleet Tracker</h1>
          <p className="text-gray-400">US Navy Carrier Strike Group Deployments</p>
        </div>
        <div className="text-xs text-gray-600">
          Last updated: {new Date(fleet.last_updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Carriers", value: fleet.summary.total_carriers, color: "text-white" },
          { label: "Deployed", value: fleet.summary.deployed, color: "text-emerald-400" },
          { label: "In Port", value: fleet.summary.in_port, color: "text-blue-400" },
          { label: "Maintenance", value: fleet.summary.maintenance, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#141b2d] border border-[#1e2a45] rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Deployed */}
      {deployed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-emerald-400 mb-4">Currently Deployed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deployed.map((c: any) => (
              <div key={c.hull_number} className="bg-[#141b2d] border border-emerald-500/20 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-gray-500 text-xs font-mono">{c.hull_number}</span>
                    <h3 className="text-white font-bold text-lg">{c.ship_name}</h3>
                    {c.air_wing && <p className="text-gray-500 text-xs">Air Wing: {c.air_wing}</p>}
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                {c.region && (
                  <div className="text-sm text-emerald-400 mb-2">
                    {c.region}
                  </div>
                )}
                {c.home_port && <p className="text-xs text-gray-600">Home port: {c.home_port}</p>}
                {c.latest_activity && <p className="text-sm text-gray-400 mt-2">{c.latest_activity}</p>}
                {c.recent_activity && c.recent_activity.length > 0 && (
                  <div className="mt-3 border-t border-[#1e2a45] pt-2">
                    {c.recent_activity.slice(0, 3).map((a: any, i: number) => (
                      <div key={i} className="text-xs text-gray-500 mb-1">
                        <span className="text-gray-600 font-mono">{a.date}</span> — {a.event}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Port */}
      {inPort.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-blue-400 mb-4">In Port</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {inPort.map((c: any) => (
              <div key={c.hull_number} className="bg-[#141b2d] border border-[#1e2a45] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-600 text-xs font-mono">{c.hull_number}</span>
                    <h3 className="text-white font-semibold">{c.ship_name}</h3>
                    {c.home_port && <p className="text-xs text-gray-600">{c.home_port}</p>}
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                {c.latest_activity && <p className="text-xs text-gray-500 mt-2">{c.latest_activity}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance / Other */}
      {(maintenance.length > 0 || other.length > 0) && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-amber-400 mb-4">Maintenance & Other</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...maintenance, ...other].map((c: any) => (
              <div key={c.hull_number} className="bg-[#141b2d] border border-[#1e2a45] rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-600 text-xs font-mono">{c.hull_number}</span>
                    <h3 className="text-white font-semibold">{c.ship_name}</h3>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                {c.latest_activity && <p className="text-xs text-gray-500 mt-2">{c.latest_activity}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {fleet.sources && fleet.sources.length > 0 && (
        <div className="mt-8 text-xs text-gray-600 border-t border-[#1e2a45] pt-4">
          <span className="text-gray-500">Sources:</span>{" "}
          {fleet.sources.map((s: any, i: number) => (
            <span key={i}>{typeof s === "string" ? s : s.name || s.url}{i < fleet.sources.length - 1 ? ", " : ""}</span>
          ))}
        </div>
      )}
    </div>
  );
}
