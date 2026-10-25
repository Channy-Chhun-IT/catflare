import React, { useState, useRef, useEffect } from 'react';
import { 
  Bookmark, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  MousePointer, 
  Globe, 
  Sparkles, 
  Mail, 
  Lock, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { CatFlareLogo } from './CatFlareLogo';
import { 
  generateZoneCreatorBookmarkletCode,
  ZoneCreatorConfig 
} from '../services/bookmarkletGenerator';

export const BookmarkletStudio: React.FC = () => {
  // Pre-fill fields
  const [zcDomain, setZcDomain] = useState('');
  const [zcEmail, setZcEmail] = useState('');
  const [zcPassword, setZcPassword] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Bookmark anchor DOM ref to bypass React synthetic href sanitizer for javascript: URLs
  const zoneCreatorBookmarkRef = useRef<HTMLAnchorElement>(null);

  const zoneCreatorConfig: ZoneCreatorConfig = {
    defaultDomain: zcDomain,
    defaultEmail: zcEmail,
    defaultPassword: zcPassword,
  };

  const zoneCreatorBookmarkletCode = generateZoneCreatorBookmarkletCode(zoneCreatorConfig);

  // Directly set DOM href attribute to bypass React's javascript: URL blocker
  useEffect(() => {
    if (zoneCreatorBookmarkRef.current) {
      zoneCreatorBookmarkRef.current.setAttribute('href', zoneCreatorBookmarkletCode);
    }
  }, [zoneCreatorBookmarkletCode]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(id);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-zinc-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500 text-zinc-950 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow">
                <Bookmark className="w-3.5 h-3.5 fill-zinc-950" />
                Bookmarks Bar Automation
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Locks Free Plan ($0)
              </span>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1 pl-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero API Keys &bull; 100% In-Browser
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <CatFlareLogo size="md" />
              <span>Cloudflare Auto-Sign Up, Free Plan &amp; Nameservers</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Designed for client accounts and new domains! Uses your <strong>Bookmarks Bar</strong> in a clean <strong>3-click workflow</strong>: fills credentials on the Cloudflare Sign-Up form, adds the domain to your account and opens the Plans page, <strong>locks in the Free Plan ($0)</strong> without skipping Cloudflare onboarding, and returns both assigned <strong>Nameservers</strong> with 1-click copy.
            </p>
          </div>

          {/* Action Box: Draggable Bookmarklet Button */}
          <div className="bg-zinc-950/80 p-5 rounded-xl border border-zinc-800 text-center space-y-3 self-stretch md:self-auto flex flex-col items-center justify-center min-w-[280px]">
            <span className="text-[11px] text-zinc-300 font-medium flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
              Drag to your Bookmarks Bar:
            </span>

            <a
              ref={zoneCreatorBookmarkRef}
              href="#"
              draggable="true"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold px-4 py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/20 cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all transform hover:scale-102"
              title="Drag this button up to your browser bookmarks bar"
            >
              <Bookmark className="w-4 h-4 fill-zinc-950" />
              <span>🌐 CF Sign-UP</span>
            </a>

            <div className="w-full pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(zoneCreatorBookmarkletCode, 'zc_bm_url')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Copy bookmark URL to paste manually into a new bookmark"
              >
                {copiedType === 'zc_bm_url' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied Bookmark URL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Bookmark URL</span>
                  </>
                )}
              </button>
            </div>

            <span className="text-[10.5px] text-zinc-400">
              Drag button to Bookmarks Bar, or copy URL into a new bookmark
            </span>
          </div>
        </div>
      </div>

      {/* Optional Pre-fills */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Optional Pre-Fill Settings</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Optionally pre-set your target domain and client credentials below, or leave them empty to type directly inside Cloudflare.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Target Domain
            </label>
            <input
              type="text"
              value={zcDomain}
              onChange={(e) => setZcDomain(e.target.value)}
              placeholder="e.g. clientdomain.com"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              Cloudflare Email
            </label>
            <input
              type="email"
              value={zcEmail}
              onChange={(e) => setZcEmail(e.target.value)}
              placeholder="client@domain.com"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              CF Password
            </label>
            <input
              type="password"
              value={zcPassword}
              onChange={(e) => setZcPassword(e.target.value)}
              placeholder="Min 8 chars, 1 number & 1 symbol"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* The 3-Click Visual Workflow Guide */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <span>3-Click Bookmarks Bar Workflow</span>
          </h3>
          <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
            No Extensions &bull; No Tampermonkey
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 font-black flex items-center justify-center text-xs shadow-md shadow-emerald-500/20">
                1
              </span>
              <div>
                <span className="font-bold text-zinc-100 text-xs block">1st Click: Sign-Up Page</span>
                <span className="text-[10px] text-zinc-400 font-mono">dash.cloudflare.com/sign-up</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Open sign-up and click bookmark:
            </p>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 text-[11px] text-zinc-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3 h-3" />
                <span>Fills email &amp; password</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3 h-3" />
                <span>Remembers target domain</span>
              </div>
              <div className="text-zinc-400 pt-0.5 text-[10px]">
                ➔ Complete Turnstile &amp; click <strong>Sign Up</strong>.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 font-black flex items-center justify-center text-xs shadow-md shadow-emerald-500/20">
                2
              </span>
              <div>
                <span className="font-bold text-zinc-100 text-xs block">2nd Click: New Account</span>
                <span className="text-[10px] text-emerald-400 font-medium">Auto-Adds Domain &amp; Shows NS</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Inside your new empty account, click bookmark:
            </p>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 text-[11px] text-zinc-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3 h-3" />
                <span>Verifies account is fresh (0 domains)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3 h-3" />
                <span>Adds domain &amp; shows Nameservers once</span>
              </div>
              <div className="text-zinc-400 pt-0.5 text-[10px]">
                ➔ Copy NS &amp; click &quot;Open Domain Overview&quot;.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 font-black flex items-center justify-center text-xs shadow-md shadow-emerald-500/20">
                3
              </span>
              <div>
                <span className="font-bold text-zinc-100 text-xs block">3rd Click: Domain Overview</span>
                <span className="text-[10px] text-emerald-400 font-medium">Free Plan &amp; Activation Only</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed">
              On the freshly added domain overview, click bookmark:
            </p>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-2.5 text-[11px] text-zinc-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3 h-3" />
                <span>Selects Free Plan ($0) &amp; Continue</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3 h-3" />
                <span>Confirms onboarding activation</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-3 h-3" />
                <span>Auto-closes (no duplicate NS popup)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Safety Guarantee & Policy Note */}
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3.5 flex items-start gap-3 text-xs text-emerald-200/90 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 font-semibold">100% Cloudflare Account Safe:</strong> Operates strictly inside your logged-in browser session using standard UI button clicks and official API endpoints. No bot scrapers, no headless tools, and no violation of Cloudflare policies. Completely safe for all client accounts now and in the future.
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-semibold">Cloudflare Email Verification:</strong> Cloudflare often requires verifying the confirmation link sent to your client&apos;s email before allowing new domains to be added. If prompted by Cloudflare, simply click the link in their email, then click <strong>&quot;🔄 Retry&quot;</strong> in the CatFlare popup!
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarklet Code Box */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-zinc-200">
              Bookmarklet JavaScript URL:
            </label>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Paste this entire line into the URL field of a browser bookmark if you prefer manual setup over dragging.
            </p>
          </div>

          <button
            onClick={() => copyToClipboard(zoneCreatorBookmarkletCode, 'zc_bm_bottom')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
          >
            {copiedType === 'zc_bm_bottom' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
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
          {zoneCreatorBookmarkletCode.slice(0, 360)}...
        </div>
      </div>
    </div>
  );
};
