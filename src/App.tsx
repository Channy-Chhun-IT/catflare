import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { CFSetupTab } from './components/CFSetupTab';
import { BookmarkletStudio } from './components/BookmarkletStudio';
import { DnsCheckerModal } from './components/DnsCheckerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cf_setup');
  const [isDnsCheckOpen, setIsDnsCheckOpen] = useState(false);
  const [dnsCheckTarget, setDnsCheckTarget] = useState('');

  const handleOpenDnsCheck = (domain?: string) => {
    setDnsCheckTarget(domain || '');
    setIsDnsCheckOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-zinc-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDnsCheck={() => handleOpenDnsCheck()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'cf_setup' ? (
          <CFSetupTab onSwitchToSignup={() => setActiveTab('signup_ns')} />
        ) : (
          <BookmarkletStudio />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            CatFlare &mdash; In-Browser Zero-Key Cloudflare Automation by Catech
          </span>
          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setActiveTab('cf_setup')}
              className={`hover:underline cursor-pointer ${activeTab === 'cf_setup' ? 'text-orange-400' : ''}`}
            >
              CF Setup (DNS &amp; SSL)
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('signup_ns')}
              className={`hover:underline cursor-pointer ${activeTab === 'signup_ns' ? 'text-emerald-400' : ''}`}
            >
              Sign-Up &amp; Nameservers
            </button>
            <span>&bull;</span>
            <button
              onClick={() => handleOpenDnsCheck()}
              className="hover:text-zinc-200 hover:underline cursor-pointer"
            >
              Check Nameservers
            </button>
          </div>
        </div>
      </footer>

      {/* DNS Propagation Modal */}
      <DnsCheckerModal
        isOpen={isDnsCheckOpen}
        onClose={() => setIsDnsCheckOpen(false)}
        initialDomain={dnsCheckTarget}
      />
    </div>
  );
}
