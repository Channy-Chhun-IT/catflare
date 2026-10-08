import React from 'react';
import { Search } from 'lucide-react';
import { CatFlareLogo } from './CatFlareLogo';

interface NavbarProps {
  onOpenDnsCheck: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDnsCheck,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <CatFlareLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-100 text-lg tracking-tight flex items-center">
                Cat<span className="text-orange-500">Flare</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-orange-400 font-mono border border-zinc-700/60 font-semibold">
                by Catech
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Zero-Key In-Browser Automation &amp; DNS Suite
            </p>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* DNS Lookup */}
          <button
            onClick={onOpenDnsCheck}
            title="Live DNS Propagation Checker"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-orange-400" />
            <span>Check DNS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
