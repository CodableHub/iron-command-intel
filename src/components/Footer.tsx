import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#1e2a45] bg-[#0a0f1a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter capture */}
        <div className="bg-[#141b2d] border border-[#1e2a45] rounded-xl p-6 mb-10 text-center">
          <h3 className="text-lg font-bold text-white mb-1">The Intel Brief</h3>
          <p className="text-sm text-gray-400 mb-4">
            Weekly intelligence briefing from a former military intelligence specialist. Free.
          </p>
          <form
            className="flex gap-2 max-w-md mx-auto"
            action="https://the-intel-brief.beehiiv.com/subscribe"
            method="POST"
            target="_blank"
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="flex-1 bg-[#0a0f1a] border border-[#1e2a45] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#eac054]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#eac054] text-[#0a0f1a] font-bold text-sm rounded-lg hover:bg-[#f0cc6a] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

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
              <Link href="/fleet" className="block text-sm text-gray-400 hover:text-white transition-colors">
                Fleet Tracker
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-[#eac054] text-sm font-semibold uppercase mb-3">Iron Command</h4>
            <div className="space-y-2">
              <a href="https://youtube.com/@ironcommandyt" target="_blank" rel="noopener noreferrer"
                className="block text-sm text-gray-400 hover:text-white transition-colors">
                YouTube Channel
              </a>
              <a href="https://ironcommand.co" target="_blank" rel="noopener noreferrer"
                className="block text-sm text-gray-400 hover:text-white transition-colors">
                ironcommand.co
              </a>
              <a href="https://ironcommand.co/partners/" target="_blank" rel="noopener noreferrer"
                className="block text-sm text-gray-400 hover:text-white transition-colors">
                Partner With Us
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
