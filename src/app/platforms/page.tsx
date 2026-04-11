import { getPlatforms } from "@/lib/data";
import { PlatformCard } from "@/components/PlatformCard";
import { Metadata } from "next";
import { PlatformFilters } from "./PlatformFilters";

export const metadata: Metadata = {
  title: "Military Equipment Database",
  description: "Browse 69+ military platforms with detailed specs, armament, doctrine, and combat history. Destroyers, submarines, carriers, frigates, and more.",
};

export default async function PlatformsPage() {
  const platforms = await getPlatforms();

  const types = Array.from(new Set(platforms.map((p) => p.type).filter(Boolean))) as string[];
  const countries = Array.from(new Set(platforms.map((p) => p.country).filter(Boolean))) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Military Equipment Database</h1>
      <p className="text-gray-400 mb-8">
        {platforms.length} platforms across {countries.length} nations
      </p>
      <PlatformFilters platforms={platforms} types={types.sort()} countries={countries.sort()} />
    </div>
  );
}
