import { getPlatform, getAllSlugs, resolvePeerSlug } from "@/lib/data";
import { FLAG, formatCost, getTypeColor, isNuclearPropulsion } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { DeploymentMap } from "@/components/DeploymentMap";
import { FleetTable } from "@/components/FleetTable";
import { PlatformTimeline } from "@/components/PlatformTimeline";

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
  const isNuclear = isNuclearPropulsion(specs.propulsion);

  // Resolve peer slugs from the platform index
  const peerLinks = await Promise.all(
    (p.peer_comparisons || []).map(async (peer) => ({
      ...peer,
      slug: await resolvePeerSlug(peer.platform),
    }))
  );

  // Fleet status-derived counts
  const fleet = p.fleet_status_json || [];
  const fleetCounts = fleet.reduce((acc, h) => {
    const s = (h.status || "unknown").toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const activeCount = fleetCounts["active"] || fleetCounts["operational"] || 0;
  const buildingCount = fleetCounts["building"] || fleetCounts["construction"] || 0;

  // IC video embeds — platforms featured in published comparisons
  const IC_VIDEOS: Record<string, { id: string; title: string }> = {
    "arleigh-burke-class": { id: "txNfbmfQ1RU", title: "Arleigh Burke vs Type 055 — Which Destroyer Actually Wins?" },
    "type-055-renhai-class-destroyer": { id: "txNfbmfQ1RU", title: "Arleigh Burke vs Type 055 — Which Destroyer Actually Wins?" },
  };
  const icVideo = IC_VIDEOS[slug];

  // Operational patterns — accept both old and new field names
  const op = p.operational_patterns || null;
  const opOperatingAreas: string[] = op
    ? (Array.isArray(op.key_operating_areas) ? op.key_operating_areas :
       typeof op.operating_areas === "string" ? op.operating_areas.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [])
    : [];
  const opDeploymentLength = op?.deployment_length_months
    ? `${op.deployment_length_months} months`
    : (op as any)?.deployment_length || null;

  // Range display — handle nuclear-powered case
  const rangeDisplay =
    specs.range_nm && specs.range_nm > 0
      ? `${specs.range_nm.toLocaleString()} nm`
      : isNuclear
      ? "Unlimited (nuclear)"
      : null;

  // FAQ data for JSON-LD + rendered section
  const faq: { q: string; a: string }[] = [];
  if (activeCount > 0 || p.unit_count) {
    const inService = activeCount || p.unit_count;
    const building = buildingCount ? `, with ${buildingCount} under construction` : "";
    faq.push({
      q: `How many ${p.name} are in service?`,
      a: `${inService} ${p.name} are currently in service with ${p.operator || p.country}${building}.`,
    });
  }
  if (p.first_commissioned) {
    faq.push({ q: `When was the first ${p.name} commissioned?`, a: `The first ${p.name} entered service in ${p.first_commissioned}.` });
  }
  if (p.builder) {
    faq.push({ q: `Who builds the ${p.name}?`, a: `The ${p.name} is built by ${p.builder}.` });
  }
  if (p.variants_json && p.variants_json.length > 1) {
    const variants = p.variants_json.map((v) => v.name).join(", ");
    faq.push({ q: `What variants of the ${p.name} exist?`, a: `Known variants include: ${variants}.` });
  }
  if (p.cost_usd) {
    faq.push({ q: `How much does a ${p.name} cost?`, a: `Unit cost is approximately ${formatCost(p.cost_usd)} per hull.` });
  }

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${p.name} — Specifications, Armament & Analysis`,
        description: p.overview_md?.split("\n")[0]?.slice(0, 300) || "",
        image: p.image_url || undefined,
        dateModified: p.updated_at,
        author: { "@type": "Organization", name: "Iron Command Intel" },
        publisher: { "@type": "Organization", name: "Iron Command" },
        about: {
          "@type": "Product",
          name: p.name,
          manufacturer: p.builder ? { "@type": "Organization", name: p.builder } : undefined,
          countryOfOrigin: p.country,
          model: p.designation || undefined,
        },
      },
      faq.length > 0 && {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ].filter(Boolean),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
              <span className="text-[#eac054] font-bold">
                {activeCount > 0 ? activeCount : p.unit_count || "?"}
                {buildingCount > 0 && (
                  <span className="text-blue-400 text-xs font-normal ml-2">+{buildingCount} building</span>
                )}
              </span>
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
          {peerLinks.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#1e2a45]">
              <p className="text-xs text-gray-500 uppercase mb-2">Compare with</p>
              {peerLinks.slice(0, 4).map((peer, i) => (
                <div key={i} className="mb-1">
                  {peer.slug ? (
                    <Link href={`/compare?a=${p.slug}&b=${peer.slug}`}
                      className="block text-sm text-[#48c0bf] hover:text-white transition-colors">
                      vs {peer.platform} ({FLAG[peer.country] || ""} {peer.country}) →
                    </Link>
                  ) : (
                    <span className="block text-sm text-gray-500">
                      vs {peer.platform} ({FLAG[peer.country] || ""} {peer.country})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* IC Video Comparison */}
      {icVideo && (
        <div className="bg-gradient-to-r from-[#141b2d] to-[#1e2a45] border border-[#eac054]/20 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-[#eac054] mb-3">Iron Command Video Analysis</h2>
          <div className="aspect-video rounded-lg overflow-hidden mb-3">
            <iframe
              src={`https://www.youtube.com/embed/${icVideo.id}`}
              title={icVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="w-full h-full"
            />
          </div>
          <p className="text-sm text-gray-400">{icVideo.title}</p>
        </div>
      )}

      {/* Overview */}
      {p.overview_md && (
        <Section title="Overview">
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{p.overview_md}</p>
        </Section>
      )}

      {/* Deployment Map */}
      {(fleet.length > 0 || opOperatingAreas.length > 0) && (
        <Section title="Deployment Map">
          <DeploymentMap fleet={fleet} aors={opOperatingAreas} fallbackHomePort={null} />
          <p className="text-xs text-gray-600 mt-3">
            Home ports from known hull assignments. Operating areas reflect typical AORs — individual deployments will vary.
          </p>
        </Section>
      )}

      {/* Timeline */}
      <Section title="Timeline">
        <PlatformTimeline p={p} />
      </Section>

      {/* Specifications */}
      <Section title="Specifications">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Displacement", value: specs.displacement_tonnes ? `${specs.displacement_tonnes.toLocaleString()}t` : null },
            { label: "Length", value: specs.length_m ? `${specs.length_m}m` : null },
            { label: "Beam", value: specs.beam_m ? `${specs.beam_m}m` : null },
            { label: "Draft", value: specs.draft_m ? `${specs.draft_m}m` : null },
            { label: "Speed", value: specs.speed_knots ? `${specs.speed_knots} kn` : null },
            { label: "Range", value: rangeDisplay },
            { label: "Crew", value: specs.crew?.toString() || null },
            { label: "VLS Cells", value: specs.vls_cells?.toString() || null },
            { label: "Dive Depth", value: specs.additional?.diving_depth_m ? `${specs.additional.diving_depth_m}m` : null },
            { label: "Torpedo Tubes", value: specs.additional?.torpedo_tubes?.toString() || null },
            { label: "Torpedo Room", value: specs.additional?.torpedo_room_capacity || null },
            { label: "Reactor Life", value: specs.additional?.reactor_life_years ? `${specs.additional.reactor_life_years} yrs` : null },
          ].filter(s => s.value).map((s) => (
            <div key={s.label} className="bg-[#0a0f1a] rounded-lg p-3 text-center">
              <div className="text-[#eac054] font-bold text-lg">{s.value}</div>
              <div className="text-gray-500 text-xs uppercase">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {specs.propulsion && <SpecRow label="Propulsion" value={specs.propulsion} />}
          {specs.radar && <SpecRow label="Radar" value={specs.radar} />}
          {specs.sonar && <SpecRow label="Sonar" value={specs.sonar} />}
          {specs.combat_system && <SpecRow label="Combat System" value={specs.combat_system} />}
          {specs.additional?.special_features && <SpecRow label="Special Features" value={specs.additional.special_features} />}
        </div>
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
          {p.doctrine.employment && (
            <div className="mb-4">
              <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Employment</h4>
              <p className="text-gray-300 text-sm">{p.doctrine.employment}</p>
            </div>
          )}
          {p.doctrine.threat_context && (
            <div className="mb-4">
              <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Threat Context</h4>
              <p className="text-gray-300 text-sm">{p.doctrine.threat_context}</p>
            </div>
          )}
          {p.doctrine.comparison_frame && (
            <div>
              <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">How to Compare</h4>
              <p className="text-gray-300 text-sm">{p.doctrine.comparison_frame}</p>
            </div>
          )}
        </Section>
      )}

      {/* Operational Patterns */}
      {op && (
        <Section title="Operational Patterns">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {op.typical_deployment && (
              <div>
                <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Typical Deployment</h4>
                <p className="text-gray-300 text-sm">{op.typical_deployment}</p>
              </div>
            )}
            {opDeploymentLength && (
              <div>
                <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Deployment Length</h4>
                <p className="text-gray-300 text-sm">{opDeploymentLength}</p>
              </div>
            )}
            {op.typical_task_group && (
              <div>
                <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Typical Task Group</h4>
                <p className="text-gray-300 text-sm">{op.typical_task_group}</p>
              </div>
            )}
            {op.readiness_notes && (
              <div>
                <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-1">Readiness</h4>
                <p className="text-gray-300 text-sm">{op.readiness_notes}</p>
              </div>
            )}
          </div>
          {opOperatingAreas.length > 0 && (
            <div className="mt-4">
              <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-2">Key Operating Areas</h4>
              <div className="flex flex-wrap gap-2">
                {opOperatingAreas.map((a, i) => (
                  <span key={i} className="text-xs bg-[#48c0bf]/10 text-[#48c0bf] border border-[#48c0bf]/30 px-2 py-1 rounded">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Peer Comparisons — key differences */}
      {peerLinks.length > 0 && (
        <Section title="Peer Comparison Matrix">
          <div className="space-y-4">
            {peerLinks.map((peer, i) => (
              <div key={i} className="bg-[#0a0f1a] rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{peer.platform}</span>
                    <span className="text-xs text-gray-500">{FLAG[peer.country] || ""} {peer.country}</span>
                    {peer.relationship && (
                      <span className="text-xs bg-[#141b2d] text-gray-400 px-2 py-0.5 rounded capitalize">
                        {peer.relationship}
                      </span>
                    )}
                  </div>
                  {peer.slug && (
                    <Link href={`/compare?a=${p.slug}&b=${peer.slug}`}
                      className="text-xs text-[#48c0bf] hover:text-white">Compare →</Link>
                  )}
                </div>
                {peer.key_differences && (
                  <p className="text-sm text-gray-300 mb-2">{peer.key_differences}</p>
                )}
                {peer.video_angle && (
                  <p className="text-xs text-[#eac054] italic">
                    Video angle: {peer.video_angle}
                  </p>
                )}
              </div>
            ))}
          </div>
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
                {v.context && (
                  <p className="text-gray-500 text-xs mt-2">
                    <span className="text-amber-400">Context:</span> {v.context}
                  </p>
                )}
                {v.mitigation && (
                  <p className="text-gray-500 text-xs mt-1">
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
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Key Changes</th>
                </tr>
              </thead>
              <tbody>
                {p.variants_json.map((v, i) => (
                  <tr key={i} className="border-b border-[#1e2a45]/50 align-top">
                    <td className="py-2 pr-4 text-white font-semibold">{v.name}</td>
                    <td className="py-2 pr-4 text-gray-400 font-mono text-xs">{v.designation_range || "—"}</td>
                    <td className="py-2 pr-4 text-gray-400">{v.years || "—"}</td>
                    <td className="py-2 pr-4 text-[#eac054]">{v.count || "—"}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        v.status === "active" ? "bg-green-500/10 text-green-400" :
                        v.status === "building" ? "bg-blue-500/10 text-blue-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}>{v.status || "—"}</span>
                    </td>
                    <td className="py-2 text-gray-400 text-xs max-w-md">{v.key_changes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Fleet Status — per hull */}
      {fleet.length > 0 && (
        <Section title={`Fleet Roster (${fleet.length})`}>
          <FleetTable fleet={fleet} />
        </Section>
      )}

      {/* Modernization */}
      {p.modernization && p.modernization.length > 0 && (
        <Section title="Modernization Programmes">
          <div className="space-y-3">
            {p.modernization.map((m, i) => (
              <div key={i} className="bg-[#0a0f1a] rounded-lg p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h4 className="text-white font-semibold text-sm">{m.program || m.name || "Programme"}</h4>
                  <div className="flex gap-2 text-xs">
                    {m.status && (
                      <span className={`px-2 py-0.5 rounded capitalize ${
                        m.status === "completed" ? "bg-green-500/10 text-green-400" :
                        m.status === "in-progress" ? "bg-blue-500/10 text-blue-400" :
                        m.status === "planned" ? "bg-amber-500/10 text-amber-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}>{m.status}</span>
                    )}
                    {m.timeline && <span className="text-gray-500 font-mono">{m.timeline}</span>}
                  </div>
                </div>
                {m.description && <p className="text-gray-400 text-sm">{m.description}</p>}
                {m.impact && (
                  <p className="text-xs text-[#48c0bf] mt-2">
                    <span className="text-gray-500">Impact:</span> {m.impact}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Images Gallery */}
      {p.images && p.images.length > 1 && (
        <Section title="Images">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {p.images.map((img: any, i: number) => (
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="group">
                <div className="rounded-lg overflow-hidden bg-[#0a0f1a] aspect-video">
                  <img src={img.url} alt={img.caption || p.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                </div>
                {img.caption && <p className="text-xs text-gray-600 mt-1 truncate">{img.caption}</p>}
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* News */}
      {p.news && p.news.length > 0 && (
        <Section title="Recent News">
          <div className="space-y-2">
            {p.news.slice(0, 10).map((n, i) => (
              <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#0a0f1a] rounded-lg hover:bg-[#1e2a45] transition-colors group">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="text-sm text-gray-300 group-hover:text-white truncate">{n.title}</div>
                  {n.published && (
                    <div className="text-xs text-gray-600 mt-0.5 font-mono">{n.published.slice(0, 10)}</div>
                  )}
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{n.source || ""}</span>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* IC Coverage — related videos / shorts */}
      {p.ic_coverage && p.ic_coverage.length > 0 && (
        <Section title="Iron Command Coverage">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {p.ic_coverage.map((c, i) => (
              <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 bg-[#0a0f1a] rounded-lg hover:bg-[#1e2a45] transition-colors">
                <div className="w-24 aspect-video bg-[#050810] rounded flex-shrink-0 flex items-center justify-center text-red-500 text-xs font-bold">
                  ▶ YT
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-200 font-semibold line-clamp-2">{c.title || "Video"}</div>
                  <div className="flex gap-2 mt-1 text-xs text-gray-500">
                    {c.kind && <span className="uppercase">{c.kind}</span>}
                    {c.published && <span>{c.published.slice(0, 10)}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <Section title="Frequently Asked">
          <div className="space-y-3">
            {faq.map((f, i) => (
              <div key={i} className="bg-[#0a0f1a] rounded-lg p-4">
                <h4 className="text-white font-semibold text-sm mb-1">{f.q}</h4>
                <p className="text-gray-400 text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Curated Sources */}
      {p.curated_sources && p.curated_sources.length > 0 && (
        <Section title="Curated Research">
          <div className="space-y-3">
            {(["essential", "recommended", "reference"] as const).map((priority) => {
              const items = p.curated_sources.filter((s) => s.priority === priority);
              if (items.length === 0) return null;
              return (
                <div key={priority}>
                  <h4 className="text-[#eac054] text-xs font-semibold uppercase mb-2">{priority}</h4>
                  <div className="space-y-2">
                    {items.map((s, i) => (
                      <div key={i} className="bg-[#0a0f1a] rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-[#48c0bf] hover:text-white font-semibold">{s.title}</a>
                          ) : (
                            <span className="text-sm text-gray-200 font-semibold">{s.title}</span>
                          )}
                          {s.type && (
                            <span className="text-xs text-gray-600 bg-[#141b2d] px-2 py-0.5 rounded capitalize flex-shrink-0">
                              {s.type}
                            </span>
                          )}
                        </div>
                        {s.relevance && <p className="text-xs text-gray-500">{s.relevance}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
        <a href="https://youtube.com/@ironcommandyt" target="_blank" rel="noopener noreferrer"
          className="inline-block px-6 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-500 transition-colors">
          Watch on YouTube
        </a>
      </div>

      {/* Sources */}
      {p.sources_json && p.sources_json.length > 0 && (
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

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-gray-400">
      <span className="text-gray-500">{label}:</span> {value}
    </div>
  );
}
