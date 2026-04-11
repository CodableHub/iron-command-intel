import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Iron Command Intel — Military Equipment Database",
    template: "%s | Iron Command Intel",
  },
  description:
    "Military intelligence analysis and equipment comparison database. Specs, doctrine, combat history, and analytical assessments for naval, air, and ground platforms worldwide.",
  keywords: [
    "military equipment", "naval comparison", "destroyer comparison",
    "submarine comparison", "military intelligence", "defense analysis",
    "warship specs", "navy comparison", "Iron Command",
  ],
  openGraph: {
    siteName: "Iron Command Intel",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
  },
  metadataBase: new URL("https://intel.ironcommand.co"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-[#0a0f1a] text-white font-[family-name:var(--font-inter)] flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
