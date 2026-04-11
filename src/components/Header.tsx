import Link from "next/link";

export function Header() {
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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/platforms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Platforms
            </Link>
            <Link href="/compare" className="text-sm text-gray-400 hover:text-white transition-colors">
              Compare
            </Link>
            <a
              href="https://youtube.com/@IronCommandSITREP"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors"
            >
              Subscribe
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
