import Link from "next/link";
import { PlatformSummary, FLAG, formatCost, getTypeColor } from "@/lib/types";

export function PlatformCard({ platform }: { platform: PlatformSummary }) {
  const flag = FLAG[platform.country || ""] || "";
  const typeColor = getTypeColor(platform.type);

  return (
    <Link
      href={`/platforms/${platform.slug}`}
      className="block bg-[#141b2d] border border-[#1e2a45] rounded-xl overflow-hidden hover:border-[#48c0bf]/30 transition-all group"
    >
      {platform.image_url && (
        <div className="h-40 overflow-hidden bg-[#0a0f1a]">
          <img
            src={platform.image_url}
            alt={platform.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-[#eac054] transition-colors">
            {platform.name}
          </h3>
          {platform.designation && (
            <span className="text-[#eac054] font-mono text-xs shrink-0">{platform.designation}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span>{flag} {platform.country}</span>
          <span className={`px-1.5 py-0.5 rounded border text-[10px] capitalize ${typeColor}`}>
            {platform.type}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {platform.unit_count != null && (
            <div>
              <div className="text-[#eac054] font-bold text-lg">{platform.unit_count}</div>
              <div className="text-gray-500 text-[10px] uppercase">Units</div>
            </div>
          )}
          {platform.vls_cells != null && platform.vls_cells > 0 && (
            <div>
              <div className="text-[#eac054] font-bold text-lg">{platform.vls_cells}</div>
              <div className="text-gray-500 text-[10px] uppercase">VLS</div>
            </div>
          )}
          {platform.displacement_tonnes != null && (
            <div>
              <div className="text-[#eac054] font-bold text-lg">
                {platform.displacement_tonnes >= 10000
                  ? `${(platform.displacement_tonnes / 1000).toFixed(0)}K`
                  : platform.displacement_tonnes.toLocaleString()}
              </div>
              <div className="text-gray-500 text-[10px] uppercase">Tonnes</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
