"use client";

import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#1e2a45] bg-[#0a0f1a]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#eac054] rounded flex items-center justify-center">
              <span className="text-[#0a0f1a] font-[family-name:var(--font-montserrat)] font-black text-sm">IC</span>
            </div>
            <div>
              <span className="text-white font-bold text-lg group-hover:text-[#eac054] transition-colors">
                Iron Command
              </span>
              <span className="text-[#eac054] font-bold text-lg ml-1">Intel</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/platforms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Platforms
            </Link>
            <Link href="/compare" className="text-sm text-gray-400 hover:text-white transition-colors">
              Compare
            </Link>
            <Link href="/fleet" className="text-sm text-gray-400 hover:text-white transition-colors">
              Fleet
            </Link>
            <a
              href="https://youtube.com/@ironcommandyt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors"
            >
              Subscribe
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav className="md:hidden pb-4 border-t border-[#1e2a45] mt-2 pt-4 space-y-3">
            <Link href="/platforms" className="block text-sm text-gray-300 hover:text-white" onClick={() => setOpen(false)}>
              Platforms
            </Link>
            <Link href="/compare" className="block text-sm text-gray-300 hover:text-white" onClick={() => setOpen(false)}>
              Compare
            </Link>
            <Link href="/fleet" className="block text-sm text-gray-300 hover:text-white" onClick={() => setOpen(false)}>
              Fleet Tracker
            </Link>
            <a href="https://ironcommand.co" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white">
              ironcommand.co
            </a>
            <a
              href="https://youtube.com/@ironcommandyt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Subscribe on YouTube
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
