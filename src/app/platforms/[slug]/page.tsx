import { getPlatform, getAllSlugs, FLAG, formatCost, getTypeColor } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const platform = await getPlatform(slug);
  if (!platform) return { title: "Not Found" };
  const flag = FLAG[platform.country || ""] || "";
  return {
    title: `${platform.name} — Specs, Armament & Analysis`,
    description: `Complete military intelligence profile: ${platform.name} (${platform.designation || platform.type}). Specifications, armament, combat history, vulnerabilities, and doctrine analysis. ${flag} ${platform.country}.`,
    openGraph: {
      title: `${platform.name} | Iron Command Intel`,
      description: `${platform.unit_count || "?"} in service. ${(platform.specs_json?.vls_cells || "?")} VLS cells. Full specs, armament breakdown, doctrine, and combat record.`,
      images: platform.image_url ? [platform.image_url] : [],
    },
  };
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPlatform(slug);
  if (!p) notFound();

  const flag = FLAG[p.country || ""] || "";
  const specs = p.specs_json || {};
  const typeColor = getTypeColor(p.type);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/platforms" className="hover:text-white">Platforms</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{p.name}</span>
      </nav>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {p.image_url && (
            <div className="rounded-xl overflow-hidden mb-4 bg-[#141b2d]">
              <img src={p.image_url} alt={p.name} className="w-full h-64 md:h-80 object-cover" />
            </div>
          )}
        </div>
        <div className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{p.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {p.designation && <span className="text-[#eac054] font-mono text-sm">{p.designation}</span>}
            <span className={`px-2 py-0.5 rounded border text-xs capitalize ${typeColor}`}>{p.type}</span>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Country</span>
              <span className="text-white">{flag} {p.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Operator</span>
              <span className="text-white">{p.operator}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">In Service</span>
              <span className="text-[#eac054] font-bold">{p.unit_count || "?"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cost/Hull</span>
              <span className="text-white">{formatCost(p.cost_usd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">First Commissioned</span>
              <span className="text-white">{p.first_commissioned || "?"}</span>
            </div>
            {p.builder && (
              <div className="flex justify-between">
                <span className="text-gray-500">Builder</span>
                <span className="text-white text-right text-xs max-w-[60%]">{p.builder}</span>
              </div>
            )}
          </div>
          {/* Compare CTA */}
          {p.peer_comparisons.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#1e2a45]">
              <p className="text-xs text-gray-500 uppercase mb-2">Compare with</p>
              {p.peer_comparisons.slice(0, 3).map((peer, i) => (
                <div key={i} className="text-sm text-[#48c0bf] mb-1">
                  vs {peer.platform} ({FLAG[peer.country] || ""} {peer.country})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overview */}
      {p.overview_md && (
        <Section title="Overview">
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{p.overview_md}</p>
        </Section>
      )}

      {/* Specifications */}
      <Section title="Specifications">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Displacement", value: specs.displacement_tonnes ? `${specs.displacement_tonnes.toLocaleString()}t` : null },
            { label: "Length", value: specs.length_m ? `${specs.length_m}m` : null },
            { label: "Beam", value: specs.beam_m ? `${specs.beam_m}m` : null },
            { label: "Draft", value: specs.draft_m ? `${specs.draft_m}m` : null },
            { label: "Speed", value: specs.speed_knots ? `${specs.speed_knots} kn` : null },
            { label: "Range", value: specs.range_nm ? `${specs.range_nm.toLocaleString()} nm` : null },
            { label: "Crew", value: specs.crew?.toString() || null },
            { label: "VLS Cells", value: specs.vls_cells?.toString() || null },
          ].filter(s => s.value).map((s) => (
            <div key={s.label} className="bg-[#0a0f1a] rounded-lg p-3 text-center">
              <div className="text-[#eac054] font-bold text-lg">{s.value}</div>
              <div className="text-gray-500 text-xs uppercase">{s.label}</div>
            </div>
          ))}
        </div>
        {specs.propulsion && (
          <div className="mt-4 text-sm text-gray-400">
            <span className="text-gray-500">Propulsion:</span> {specs.propulsion}
          </div>
        )}
        {specs.radar && (
          <div className="mt-2 text-sm text-gray-400">
            <span className="text-gray-500">Radar:</span> {specs.radar}
          </div>
        )}
        {specs.combat_system && (
          <div className="mt-2 text-sm text-gray-400">
            <span className="text-gray-500">Combat System:</span> {specs.combat_system}
          </div>
        )}
      </Section>

      {/* Armament */}
      {p.armament_json.length > 0 && (
        <Section title="Armament">
          <div className="space-y-4">
            {p.armament_json.map((a, i) => (
              <div key={i} className="flex items-start gap-4 bg-[#0a0f1a] rounded-lg p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#eac054] font-bold text-sm">{a.name}</span>
                    <span className="text-xs text-gray-600 bg-[#141b2d] px-2 py-0.5 rounded">{a.category}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {a.quantity && <span className="mr-3">{a.quantity}</span>}
                    {a.range_km != null && a.range_km > 0 && <span className="mr-3">{a.range_km}km range</span>}
                  </div>
                  {a.notes && <p className="text-xs text-gray-500 mt-1">{a.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Doctrine */}
      {p.doctrine && (
        <Section title="Doctrine & Employment">
          {p.doctrine.role && (
            <div className="mb-4">
              <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Role</h4>
              <p className="text-gray-300 text-sm">{p.doctrine.role}</p>
            </div>
          )}
          {p.doctrine.design_philosophy && (
            <div className="mb-4">
              <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Design Philosophy</h4>
              <p className="text-gray-300 text-sm">{p.doctrine.design_philosophy}</p>
            </div>
          )}
          {p.doctrine.threat_context && (
            <div>
              <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Threat Context</h4>
              <p className="text-gray-300 text-sm">{p.doctrine.threat_context}</p>
            </div>
          )}
        </Section>
      )}

      {/* Combat History */}
      {p.combat_history.length > 0 && (
        <Section title="Combat History">
          <div className="space-y-4">
            {p.combat_history.map((c, i) => (
              <div key={i} className="border-l-2 border-[#eac054] pl-4">
                <div className="flex items-center gap-2 mb-1">
                  {c.date && <span className="text-[#eac054] text-xs font-mono">{c.date}</span>}
                  {c.operation && <span className="text-white text-sm font-semibold">{c.operation}</span>}
                </div>
                {c.event && <p className="text-gray-400 text-sm">{c.event}</p>}
                {c.significance && <p className="text-[#48c0bf] text-xs mt-1">{c.significance}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Vulnerabilities */}
      {p.vulnerabilities.length > 0 && (
        <Section title="Known Vulnerabilities">
          <div className="space-y-4">
            {p.vulnerabilities.map((v, i) => (
              <div key={i} className="bg-[#0a0f1a] rounded-lg p-4">
                <h4 className="text-red-400 font-semibold text-sm mb-1">{v.area}</h4>
                <p className="text-gray-400 text-sm">{v.description}</p>
                {v.mitigation && (
                  <p className="text-gray-500 text-xs mt-2">
                    <span className="text-[#48c0bf]">Mitigation:</span> {v.mitigation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Variants */}
      {p.variants_json.length > 0 && (
        <Section title="Variants">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs uppercase border-b border-[#1e2a45]">
                  <th className="pb-2 pr-4">Variant</th>
                  <th className="pb-2 pr-4">Designation</th>
                  <th className="pb-2 pr-4">Years</th>
                  <th className="pb-2 pr-4">Count</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {p.variants_json.map((v, i) => (
                  <tr key={i} className="border-b border-[#1e2a45]/50">
                    <td className="py-2 pr-4 text-white font-semibold">{v.name}</td>
                    <td className="py-2 pr-4 text-gray-400 font-mono text-xs">{v.designation_range || "—"}</td>
                    <td className="py-2 pr-4 text-gray-400">{v.years || "—"}</td>
                    <td className="py-2 pr-4 text-[#eac054]">{v.count || "—"}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        v.status === "active" ? "bg-green-500/10 text-green-400" :
                        v.status === "building" ? "bg-blue-500/10 text-blue-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}>{v.status || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* YouTube CTA */}
      <div className="bg-gradient-to-r from-[#141b2d] to-[#1e2a45] border border-[#1e2a45] rounded-xl p-6 mt-8 text-center">
        <h3 className="text-lg font-bold text-white mb-2">
          Watch {p.name.split("-class")[0].split(" class")[0]} in Action
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Iron Command produces in-depth comparison and analysis videos for military equipment.
        </p>
        <a href="https://youtube.com/@IronCommandSITREP" target="_blank" rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-500 transition-colors">
          Watch on YouTube
        </a>
      </div>

      {/* Sources */}
      {p.sources_json.length > 0 && (
        <div className="mt-8 text-xs text-gray-600">
          <p className="uppercase tracking-wider mb-2">Sources</p>
          <div className="space-y-1">
            {p.sources_json.map((s: any, i: number) => {
              const url = typeof s === "string" ? s : s.url;
              const label = typeof s === "string" ? s : s.title || s.url;
              return url ? (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="block text-gray-500 hover:text-[#48c0bf] truncate">
                  {label}
                </a>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6 mb-6">
      <h2 className="text-lg font-bold text-[#eac054] uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </section>
  );
}
