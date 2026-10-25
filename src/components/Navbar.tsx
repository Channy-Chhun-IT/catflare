import React from 'react';
import { Search, Zap, Globe } from 'lucide-react';
import { CatFlareLogo } from './CatFlareLogo';

export type ActiveTab = 'cf_setup' | 'signup_ns';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenDnsCheck: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
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

        {/* Center / Navigation Tabs */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => onTabChange('cf_setup')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cf_setup'
                ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${activeTab === 'cf_setup' ? 'fill-zinc-950' : 'text-orange-400'}`} />
            <span>CF Setup</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('signup_ns')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'signup_ns'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${activeTab === 'signup_ns' ? 'stroke-[2.5]' : 'text-emerald-400'}`} />
            <span>Sign-Up &amp; Nameservers</span>
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* DNS Lookup */}
          <button
            onClick={onOpenDnsCheck}
            title="Live DNS Propagation Checker"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Check DNS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
