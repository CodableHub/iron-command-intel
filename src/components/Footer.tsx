import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#1e2a45] bg-[#0a0f1a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#eac054] rounded flex items-center justify-center">
                <span className="text-[#0a0f1a] font-black text-xs">IC</span>
              </div>
              <span className="text-white font-bold">Iron Command Intel</span>
            </div>
            <p className="text-sm text-gray-500">
              Military intelligence analysis and equipment comparison database.
              Built by a British military intelligence specialist.
            </p>
          </div>
          <div>
            <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-3">Browse</h4>
            <div className="space-y-2">
              <Link href="/platforms" className="block text-sm text-gray-400 hover:text-white transition-colors">
                All Platforms
              </Link>
              <Link href="/compare" className="block text-sm text-gray-400 hover:text-white transition-colors">
                Compare Equipment
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-3">Iron Command</h4>
            <div className="space-y-2">
              <a href="https://youtube.com/@IronCommandSITREP" target="_blank" rel="noopener noreferrer"
                className="block text-sm text-gray-400 hover:text-white transition-colors">
                YouTube Channel
              </a>
              <a href="https://ironcommand.co" target="_blank" rel="noopener noreferrer"
                className="block text-sm text-gray-400 hover:text-white transition-colors">
                ironcommand.co
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#1e2a45] text-xs text-gray-600 text-center">
          Iron Command Intel — Military equipment data for educational purposes.
          Specifications from open sources. Not affiliated with any government or defence organisation.
        </div>
      </div>
    </footer>
  );
}
