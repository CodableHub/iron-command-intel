import { readFile } from "fs/promises";
import path from "path";

export type { PlatformSummary, Platform } from "./types";
export { FLAG, formatCost, getTypeColor } from "./types";

import type { PlatformSummary, Platform } from "./types";

const DATA_DIR = process.env.WIKI_DATA_DIR || path.join(process.cwd(), "data", "wiki");

export async function getPlatforms(): Promise<PlatformSummary[]> {
  const filePath = path.join(DATA_DIR, "platforms.json");
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data);
}

export async function getPlatform(slug: string): Promise<Platform | null> {
  try {
    const filePath = path.join(DATA_DIR, `${slug}.json`);
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const platforms = await getPlatforms();
  return platforms.map((p) => p.slug);
}
