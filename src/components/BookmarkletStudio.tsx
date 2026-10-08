import React, { useState, useRef, useEffect } from 'react';
import { 
  Bookmark, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  Code, 
  MousePointer, 
  Globe, 
  Server, 
  Layers
} from 'lucide-react';
import { CatFlareLogo } from './CatFlareLogo';
import { 
  generateBookmarkletCode, 
  generateUserscriptCode, 
  BookmarkletConfig 
} from '../services/bookmarkletGenerator';

export const BookmarkletStudio: React.FC = () => {
  const [defaultIp, setDefaultIp] = useState('198.51.100.24');
  const [defaultRedirect, setDefaultRedirect] = useState<'www_to_root' | 'root_to_www'>('www_to_root');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookmarklet' | 'userscript'>('bookmarklet');

  // Bookmark anchor DOM ref to bypass React synthetic href sanitizer
  const bookmarkRef = useRef<HTMLAnchorElement>(null);

  const config: BookmarkletConfig = {
    defaultIp,
    defaultRedirect,
    sslMode: 'strict',
    alwaysHttps: true,
    proxyDns: true,
  };

  const bookmarkletCode = generateBookmarkletCode(config);
  const userscriptCode = generateUserscriptCode(config);

  // Directly set DOM href attribute to bypass React's javascript: URL blocker
  useEffect(() => {
    if (bookmarkRef.current) {
      bookmarkRef.current.setAttribute('href', bookmarkletCode);
    }
  }, [bookmarkletCode]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(id);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Explainer */}
      <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-zinc-900 border border-orange-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-orange-500 text-zinc-950 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow">
                <Zap className="w-3.5 h-3.5" />
                Zero API Keys Required
              </span>
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Private &amp; Safe
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <CatFlareLogo size="md" />
              <span>CatFlare In-Browser Bookmarklet</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Because you already log into Cloudflare with your client&apos;s email and password, this bookmarklet runs <strong>directly inside your existing logged-in browser tab</strong>. It sets up the Zone, Root A record, WWW CNAME, <strong>Strict SSL</strong>, <strong>Always HTTPS</strong>, and your <strong>Redirect Rule</strong> in 3 seconds &mdash; with zero API keys to copy or risk leaking!
            </p>
          </div>

          {/* Quick Action: Drag Button & Copy Options */}
          <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 text-center space-y-2.5 self-stretch md:self-auto flex flex-col items-center justify-center min-w-[260px]">
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
              <MousePointer className="w-3 h-3 text-orange-400" />
              Drag this to your Bookmarks Bar:
            </span>
            <a
              ref={bookmarkRef}
              href="#"
              draggable="true"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-bold px-4 py-3 rounded-xl text-xs shadow-lg shadow-orange-500/20 cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all transform hover:scale-102"
            >
              <Bookmark className="w-4 h-4 fill-zinc-950" />
              <span>⚡ CatFlare Setup</span>
            </a>

            <div className="w-full pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(bookmarkletCode, 'top_bm')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 rounded-lg py-1.5 px-3 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                title="Copy bookmark URL to paste into bookmark manually"
              >
                {copiedType === 'top_bm' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied URL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Bookmark URL</span>
                  </>
                )}
              </button>
            </div>

            <span className="text-[10px] text-zinc-500">
              Drag button, OR copy URL into a new bookmark
            </span>
          </div>
        </div>
      </div>

      {/* Preset Customizer */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-400" />
              <span>Customize Bookmarklet Defaults</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Pre-configure your server IP and redirect rule so you don&apos;t have to re-type them every time
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="text-emerald-400 font-medium">SSL Mode: STRICT</span>
            <span>&middot;</span>
            <span className="text-emerald-400 font-medium">Always HTTPS: ON</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Default IP */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-zinc-500" />
              <span>Default cPanel Server IP</span>
            </label>
            <input
              type="text"
              value={defaultIp}
              onChange={(e) => setDefaultIp(e.target.value.trim())}
              placeholder="e.g. 198.51.100.24"
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-orange-500"
            />
            <p className="text-[11px] text-zinc-500">
              The bookmarklet will auto-fill this cPanel IP every time you open it.
            </p>
          </div>

          {/* Default Redirect Rule */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>Redirect Option</span>
            </label>
            <select
              value={defaultRedirect}
              onChange={(e) => setDefaultRedirect(e.target.value as any)}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
            >
              <option value="www_to_root">force root</option>
              <option value="root_to_www">forece www</option>
            </select>
            <p className="text-[11px] text-zinc-500">
              Matches Cloudflare&apos;s official template: 301 wildcard dynamic redirect with /${1} preserving path &amp; query.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs: Bookmarklet vs Userscript */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('bookmarklet')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'bookmarklet'
                ? 'bg-orange-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Method 1: Browser Bookmarklet</span>
          </button>

          <button
            onClick={() => setActiveTab('userscript')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'userscript'
                ? 'bg-orange-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Method 2: Tampermonkey Userscript</span>
          </button>
        </div>

        {/* TAB 1: BOOKMARKLET */}
        {activeTab === 'bookmarklet' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-100">
                How to Install &amp; Use the Bookmarklet in 3 Simple Steps
              </h3>

              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center">1</span>
                  <span className="font-semibold text-zinc-200 block">Add to Bookmark Bar</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Drag the orange button into your browser&apos;s bookmarks bar, OR copy the code below and paste it into a new bookmark URL field.
                  </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center">2</span>
                  <span className="font-semibold text-zinc-200 block">Open Your Domain on Cloudflare</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Log into <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="text-orange-400 underline">dash.cloudflare.com</a>. Since your domain is already added, open its dashboard.
                  </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center">3</span>
                  <span className="font-semibold text-zinc-200 block">Click &amp; Launch (3 Seconds)</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Click the bookmarklet. It auto-detects your domain and connects to it (never re-assigns or changes zone). It sets up DNS, Strict SSL, Always HTTPS &amp; Redirect Rule!
                  </p>
                </div>
              </div>
            </div>

            {/* Code Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Bookmarklet Code (URL):
                </label>
                <button
                  onClick={() => copyToClipboard(bookmarkletCode, 'bookmarklet')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                >
                  {copiedType === 'bookmarklet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Bookmark URL!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Bookmark URL</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[11px] text-zinc-400 break-all max-h-24 overflow-y-auto">
                {bookmarkletCode.slice(0, 300)}...
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERSCRIPT */}
        {activeTab === 'userscript' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-100">
                Permanent Floating Button via Tampermonkey / Violentmonkey
              </h3>
              <p className="text-xs text-zinc-400">
                If you prefer not having to click a bookmark, install this script in Tampermonkey. It automatically injects an orange <strong>&quot;⚡ CatFlare Setup&quot;</strong> button in the bottom corner of Cloudflare whenever you open <code>dash.cloudflare.com</code>.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">
                catflare-setup.user.js
              </span>
              <button
                onClick={() => copyToClipboard(userscriptCode, 'userscript')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                {copiedType === 'userscript' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Script!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Userscript Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 max-h-60 overflow-y-auto leading-relaxed">
              {userscriptCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
