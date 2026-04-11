import Link from "next/link";
import { getPlatforms, FLAG } from "@/lib/data";
import { PlatformCard } from "@/components/PlatformCard";

export default async function HomePage() {
  const platforms = await getPlatforms();

  const byType: Record<string, typeof platforms> = {};
  for (const p of platforms) {
    const t = p.type || "other";
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  }

  const countries = new Set(platforms.map((p) => p.country).filter(Boolean));
  const totalHulls = platforms.reduce((sum, p) => sum + (p.unit_count || 0), 0);

  const featured = [...platforms]
    .sort((a, b) => (b.unit_count || 0) - (a.unit_count || 0))
    .slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#141b2d] to-[#0a0f1a]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-montserrat)] font-black text-white mb-4">
              Military Equipment{" "}
              <span className="text-[#eac054]">Intelligence Database</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Specs, doctrine, combat history, and analytical assessments for{" "}
              <span className="text-white font-semibold">{platforms.length} platforms</span> across{" "}
              <span className="text-white font-semibold">{countries.size} navies</span> and{" "}
              <span className="text-white font-semibold">{totalHulls.toLocaleString()} hulls</span>.
              Built by a military intelligence specialist.
            </p>
            <div className="flex gap-3">
              <Link href="/platforms" className="px-6 py-3 bg-[#eac054] text-[#0a0f1a] font-bold rounded-lg hover:bg-[#f0cc6a] transition-colors">
                Browse Platforms
              </Link>
              <Link href="/compare" className="px-6 py-3 border border-[#1e2a45] text-white rounded-lg hover:border-[#48c0bf] transition-colors">
                Compare Equipment
              </Link>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: platforms.length, label: "Platforms" },
              { value: countries.size, label: "Navies" },
              { value: `${(totalHulls / 1000).toFixed(0)}K+`, label: "Hulls Tracked" },
              { value: Object.keys(byType).length, label: "Platform Types" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#141b2d]/50 border border-[#1e2a45] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#eac054]">{stat.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Platforms</h2>
          <Link href="/platforms" className="text-sm text-[#48c0bf] hover:text-white transition-colors">
            View all {platforms.length} →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((p) => (
            <PlatformCard key={p.slug} platform={p} />
          ))}
        </div>
      </section>

      {/* Browse by Type */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">Browse by Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(byType)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([type, plats]) => (
              <Link key={type} href={`/platforms?type=${type}`}
                className="bg-[#141b2d] border border-[#1e2a45] rounded-lg p-4 hover:border-[#48c0bf]/30 transition-colors group">
                <div className="text-lg font-bold text-white capitalize group-hover:text-[#eac054] transition-colors">
                  {type}s
                </div>
                <div className="text-sm text-gray-500">
                  {plats.length} platforms
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* YouTube CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#141b2d] to-[#1e2a45] border border-[#1e2a45] rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Watch the Analysis on YouTube</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Iron Command turns this data into in-depth comparison videos with military intelligence
            analysis. Scorecards, doctrine, and the analytical calls other channels won&apos;t make.
          </p>
          <a href="https://youtube.com/@IronCommandSITREP" target="_blank" rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors">
            Subscribe on YouTube
          </a>
        </div>
      </section>
    </div>
  );
}
