import { NextResponse } from "next/server";
import { getPlatform } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platform = await getPlatform(slug);
  if (!platform) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(platform);
}
