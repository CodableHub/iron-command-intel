import Link from "next/link";
import { getPlatforms, getRecentNews, FLAG, formatCost } from "@/lib/data";
import { PlatformCard } from "@/components/PlatformCard";

export default async function HomePage() {
  const platforms = await getPlatforms();
  const recentNews = await getRecentNews(9);

  const byType: Record<string, typeof platforms> = {};
  for (const p of platforms) {
    const t = p.type || "other";
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  }

  const countries = new Set(platforms.map((p) => p.country).filter(Boolean));
  const totalHulls = platforms.reduce((sum, p) => sum + (p.unit_count || 0), 0);

  // Count combat events and news articles across all platforms
  const totalNews = recentNews.length;

  // Featured — first 2 are hero cards, remaining 4 are smaller
  const featuredSlugs = [
    "virginia-class-submarine",
    "yasen-class-submarine",
    "arleigh-burke-class",
    "type-055-renhai-class-destroyer",
    "nimitz-class-aircraft-carrier",
    "type-052d-luyang-iii",
  ];
  const featured = featuredSlugs
    .map((slug) => platforms.find((p) => p.slug === slug))
    .filter(Boolean) as typeof platforms;

  const heroCards = featured.slice(0, 2);
  const smallCards = featured.slice(2);

  // Naval-first type ordering
  const typeOrder = ["submarine", "destroyer", "carrier", "frigate", "corvette", "cruiser", "amphibious", "fighter", "bomber", "helicopter", "tank", "apc"];
  const sortedTypes = Object.entries(byType).sort((a, b) => {
    const ai = typeOrder.indexOf(a[0]);
    const bi = typeOrder.indexOf(b[0]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // Popular comparisons
  const comparisons = [
    { a: "arleigh-burke-class", b: "type-055-renhai-class-destroyer", label: "Burke vs Type 055", subtitle: "US vs China Destroyers", videoId: "txNfbmfQ1RU" },
    { a: "virginia-class-submarine", b: "yasen-class-submarine", label: "Virginia vs Yasen-M", subtitle: "US vs Russia Submarines", videoId: null },
    { a: "nimitz-class-aircraft-carrier", b: "admiral-kuznetsov-carrier", label: "Nimitz vs Kuznetsov", subtitle: "Supercarrier vs Cruiser-Carrier", videoId: null },
  ].filter(c => platforms.some(p => p.slug === c.a) && platforms.some(p => p.slug === c.b));

  return (
    <div>
      {/* Hero — split layout: text left, video right */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a0f1a]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(234,192,84,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(234,192,84,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#eac054] animate-pulse" />
                <span className="text-xs text-[#eac054] uppercase tracking-widest font-semibold">Open-Source Intelligence</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-montserrat)] font-black text-white mb-5 leading-tight">
                Military Equipment{" "}
                <span className="text-[#eac054]">Intelligence Database</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Specifications, doctrine, combat history, and analytical assessments for{" "}
                <span className="text-white font-semibold">{platforms.length} platforms</span> across{" "}
                <span className="text-white font-semibold">{countries.size} nations</span>.
                Built by a former British Military Intelligence Specialist.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/platforms" className="px-6 py-3 bg-[#eac054] text-[#0a0f1a] font-bold rounded-lg hover:bg-[#f0cc6a] transition-colors">
                  Browse Platforms
                </Link>
                <Link href="/compare" className="px-6 py-3 border border-[#1e2a45] text-white rounded-lg hover:border-[#eac054] transition-colors">
                  Compare Equipment
                </Link>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: platforms.length.toString(), label: "Platforms" },
                  { value: countries.size.toString(), label: "Nations" },
                  { value: `${(totalHulls / 1000).toFixed(0)}K+`, label: "Hulls Tracked" },
                  { value: "6", label: "Continents" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-[#eac054] font-[family-name:var(--font-montserrat)]">{stat.value}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: latest comparison video */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#eac054]/20 to-[#48c0bf]/20 rounded-2xl blur-sm" />
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#1e2a45]">
                  <iframe
                    src="https://www.youtube.com/embed/txNfbmfQ1RU"
                    title="Arleigh Burke vs Type 055 — Which Destroyer Actually Wins?"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full"
                  />
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">Latest: Arleigh Burke vs Type 055</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility bar */}
      <section className="border-y border-[#1e2a45] bg-[#0d1525]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eac054" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Every claim fact-checked against multiple sources</span>
            </span>
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eac054" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Built by a former British Army Intelligence specialist</span>
            </span>
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eac054" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span>Open-source intelligence — no classified data</span>
            </span>
          </div>
        </div>
      </section>

      {/* Featured Platforms — hero cards first, then smaller grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Platforms</h2>
            <p className="text-sm text-gray-500 mt-1">The platforms driving today&apos;s naval balance of power</p>
          </div>
          <Link href="/platforms" className="text-sm text-[#48c0bf] hover:text-white transition-colors">
            View all {platforms.length} →
          </Link>
        </div>
        {/* Hero pair — large cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {heroCards.map((p) => (
            <Link
              key={p.slug}
              href={`/platforms/${p.slug}`}
              className="relative block bg-[#141b2d] border border-[#1e2a45] rounded-xl overflow-hidden hover:border-[#eac054]/30 transition-all group"
            >
              {p.image_url && (
                <div className="h-52 overflow-hidden">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500 text-xs">{FLAG[p.country || ""] || ""} {p.country}</span>
                  <span className="text-[#eac054] font-mono text-xs">{p.designation}</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#eac054] transition-colors">{p.name}</h3>
                <div className="flex gap-6 mt-3 text-sm">
                  {p.unit_count != null && (
                    <div>
                      <span className="text-[#eac054] font-bold">{p.unit_count}</span>
                      <span className="text-gray-500 ml-1">in service</span>
                    </div>
                  )}
                  {p.vls_cells != null && p.vls_cells > 0 && (
                    <div>
                      <span className="text-[#eac054] font-bold">{p.vls_cells}</span>
                      <span className="text-gray-500 ml-1">VLS cells</span>
                    </div>
                  )}
                  {p.displacement_tonnes != null && (
                    <div>
                      <span className="text-[#eac054] font-bold">{p.displacement_tonnes.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">tonnes</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Smaller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {smallCards.map((p) => (
            <PlatformCard key={p.slug} platform={p} />
          ))}
        </div>
      </section>

      {/* Popular Comparisons — the unique value prop */}
      <section className="bg-[#0d1525] border-y border-[#1e2a45]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Head-to-Head Comparisons</h2>
            <p className="text-gray-400">Select any two platforms. We score every category.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisons.map((c) => {
              const pa = platforms.find(p => p.slug === c.a);
              const pb = platforms.find(p => p.slug === c.b);
              if (!pa || !pb) return null;
              return (
                <Link
                  key={c.label}
                  href={`/compare?a=${c.a}&b=${c.b}`}
                  className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-5 hover:border-[#eac054]/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-400 text-sm font-semibold">{FLAG[pa.country || ""] || ""} {pa.name.split(" class")[0].split("-class")[0]}</span>
                    <span className="text-[#eac054] font-bold text-xs">VS</span>
                    <span className="text-red-400 text-sm font-semibold">{FLAG[pb.country || ""] || ""} {pb.name.split(" class")[0].split("-class")[0]}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{c.subtitle}</p>
                  {/* Quick stat comparison */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-blue-400 font-bold">{pa.unit_count || "?"}</div>
                      <div className="text-gray-600">vs</div>
                      <div className="text-red-400 font-bold">{pb.unit_count || "?"}</div>
                      <div className="text-gray-600 text-[10px]">Units</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{pa.vls_cells || "?"}</div>
                      <div className="text-gray-600">vs</div>
                      <div className="text-red-400 font-bold">{pb.vls_cells || "?"}</div>
                      <div className="text-gray-600 text-[10px]">VLS</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{formatCost(pa.cost_usd)}</div>
                      <div className="text-gray-600">vs</div>
                      <div className="text-red-400 font-bold">{formatCost(pb.cost_usd)}</div>
                      <div className="text-gray-600 text-[10px]">Cost</div>
                    </div>
                  </div>
                  {c.videoId && (
                    <div className="mt-3 pt-3 border-t border-[#1e2a45] text-center">
                      <span className="text-xs text-[#eac054]">Video comparison available →</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <Link href="/compare" className="text-sm text-[#48c0bf] hover:text-white transition-colors">
              Compare any two platforms →
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Type — naval first, with count badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-white mb-8">Browse by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sortedTypes.map(([type, plats]) => (
            <Link key={type} href={`/platforms?type=${type}`}
              className="bg-[#141b2d] border border-[#1e2a45] rounded-lg p-4 hover:border-[#eac054]/30 transition-colors group flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-white capitalize group-hover:text-[#eac054] transition-colors">
                  {type}s
                </div>
                <div className="text-xs text-gray-500">
                  {plats.length} platforms
                </div>
              </div>
              <div className="bg-[#0a0f1a] border border-[#1e2a45] rounded-full w-10 h-10 flex items-center justify-center text-[#eac054] font-bold text-sm">
                {plats.length}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Intel */}
      {recentNews.length > 0 && (
        <section className="bg-[#0d1525] border-y border-[#1e2a45]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Intel</h2>
                <p className="text-xs text-gray-500 mt-1">Auto-linked from defence news sources</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-gray-500">Live feed</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentNews.map((n, i) => (
                <a
                  key={`${n.url}-${i}`}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#141b2d] border border-[#1e2a45] rounded-lg p-4 hover:border-[#48c0bf]/30 transition-colors group"
                >
                  <div className="text-sm text-gray-300 group-hover:text-white transition-colors line-clamp-2 mb-2">
                    {n.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{n.source || "News"}</span>
                    {n.platform_name && (
                      <span className="text-xs text-[#48c0bf]">{n.platform_name}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YouTube CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#141b2d] to-[#1e2a45] border border-[#1e2a45] rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Watch the Analysis on YouTube</h2>
              <p className="text-gray-400 mb-6">
                Iron Command turns this data into in-depth comparison videos.
                Scorecards, doctrine analysis, and the honest assessments other channels won&apos;t make.
              </p>
              <div className="flex gap-3">
                <a href="https://youtube.com/@ironcommandyt" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors">
                  Subscribe on YouTube
                </a>
                <a href="https://ironcommand.co" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 border border-[#1e2a45] text-gray-300 rounded-lg hover:border-white hover:text-white transition-colors">
                  ironcommand.co
                </a>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="inline-block text-[#eac054] font-[family-name:var(--font-montserrat)] font-black text-6xl opacity-20">
                IC
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
