import { Suspense } from "react";
import { getPlatforms } from "@/lib/data";
import { CompareSelector } from "./CompareSelector";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Military Equipment — Iron Command Intel",
  description: "Head-to-head comparison of military platforms. Compare specs, armament, doctrine, and capabilities across destroyers, submarines, carriers, and more.",
};

export default async function ComparePage() {
  const platforms = await getPlatforms();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Compare Equipment</h1>
      <p className="text-gray-400 mb-8">Select two platforms for a head-to-head comparison</p>
      <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
        <CompareSelector platforms={platforms} />
      </Suspense>
    </div>
  );
}
