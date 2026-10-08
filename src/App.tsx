import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BookmarkletStudio } from './components/BookmarkletStudio';
import { DnsCheckerModal } from './components/DnsCheckerModal';

export default function App() {
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
        onOpenDnsCheck={() => handleOpenDnsCheck()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookmarkletStudio />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            CatFlare &mdash; In-Browser Zero-Key Cloudflare Automation by Catech
          </span>
          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => handleOpenDnsCheck()}
              className="hover:text-zinc-200 hover:underline"
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
