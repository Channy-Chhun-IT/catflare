import React, { useState, useRef, useEffect } from 'react';
import { 
  Bookmark, 
  Copy, 
  Check, 
  ShieldCheck, 
  Zap, 
  MousePointer, 
  Globe, 
  Server, 
  Sliders, 
  ExternalLink,
  ArrowRight,
  Code2,
  CheckCircle2
} from 'lucide-react';
import { CatFlareLogo } from './CatFlareLogo';
import { generateBookmarkletCode, BookmarkletConfig } from '../services/bookmarkletGenerator';
import { getDefaultSettings } from '../services/storage';

interface CFSetupTabProps {
  onSwitchToSignup?: () => void;
}

export const CFSetupTab: React.FC<CFSetupTabProps> = ({ onSwitchToSignup }) => {
  const [serverIp, setServerIp] = useState('198.51.100.24');
  const [redirectChoice, setRedirectChoice] = useState<'www_to_root' | 'root_to_www'>('www_to_root');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);

  // Bookmark anchor DOM ref to bypass React synthetic href sanitizer for javascript: URLs
  const cfBookmarkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const defaults = getDefaultSettings();
    if (defaults.defaultIp) {
      setServerIp(defaults.defaultIp);
    }
  }, []);

  const config: BookmarkletConfig = {
    defaultIp: serverIp.trim() || '198.51.100.24',
    defaultRedirect: redirectChoice,
    sslMode: 'strict',
    alwaysHttps: true,
    proxyDns: true,
  };

  const bookmarkletCode = generateBookmarkletCode(config);

  // Directly set DOM href attribute to bypass React's javascript: URL blocker
  useEffect(() => {
    if (cfBookmarkRef.current) {
      cfBookmarkRef.current.setAttribute('href', bookmarkletCode);
    }
  }, [bookmarkletCode]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(id);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-zinc-900 border border-orange-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-orange-500 text-zinc-950 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow">
                <Zap className="w-3.5 h-3.5 fill-zinc-950" />
                CF Setup Bookmarklet
              </span>
              <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                DNS &bull; SSL Strict &bull; Redirects
              </span>
              <span className="text-xs text-zinc-400 font-medium flex items-center gap-1 pl-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero API Keys &bull; 100% In-Browser
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <CatFlareLogo size="md" />
              <span>Cloudflare 1-Click DNS, SSL &amp; Redirect Automation</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Automates existing zones directly inside the Cloudflare Dashboard! Injects a clean in-page modal to auto-detect Account ID &amp; Domain, clear conflicting records, set <strong>Proxied Root A (@) &amp; WWW CNAME</strong>, configure <strong>SSL Strict</strong>, turn on <strong>Always Use HTTPS</strong>, and create a <strong>301 Wildcard Redirect Rule</strong> in 3 seconds.
            </p>
          </div>

          {/* Action Box: Draggable Bookmarklet Button */}
          <div className="bg-zinc-950/80 p-5 rounded-xl border border-zinc-800 text-center space-y-3 self-stretch md:self-auto flex flex-col items-center justify-center min-w-[280px]">
            <span className="text-[11px] text-zinc-300 font-medium flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-orange-400" />
              Drag to your Bookmarks Bar:
            </span>

            <a
              ref={cfBookmarkRef}
              href="#"
              draggable="true"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-bold px-4 py-3 rounded-xl text-xs shadow-lg shadow-orange-500/20 cursor-grab active:cursor-grabbing flex items-center justify-center gap-2 transition-all transform hover:scale-102"
              title="Drag this button up to your browser bookmarks bar"
            >
              <Bookmark className="w-4 h-4 fill-zinc-950" />
              <span>⚡ CatFlare CF Setup</span>
            </a>

            <div className="w-full pt-1">
              <button
                type="button"
                onClick={() => copyToClipboard(bookmarkletCode, 'cf_bm_url')}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Copy bookmark URL to paste manually into a new bookmark"
              >
                {copiedType === 'cf_bm_url' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-orange-400 font-semibold">Copied Bookmark URL!</span>
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

      {/* Preset Customization */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-400" />
            <span>Preset Configuration</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Customize the default IP and redirect behavior embedded in the bookmarklet before dragging or copying.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-orange-400" />
              cPanel Server IP (Default)
            </label>
            <input
              type="text"
              value={serverIp}
              onChange={(e) => setServerIp(e.target.value)}
              placeholder="e.g. 198.51.100.24"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              Default Redirect Option
            </label>
            <select
              value={redirectChoice}
              onChange={(e) => setRedirectChoice(e.target.value as 'www_to_root' | 'root_to_www')}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none transition-colors"
            >
              <option value="www_to_root">force root (www.domain.com &rarr; domain.com)</option>
              <option value="root_to_www">force www (domain.com &rarr; www.domain.com)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visual Step-by-Step Guide */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <span>How to use CF Setup in Cloudflare</span>
          </h3>
          <span className="text-[11px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-semibold">
            1-Click Execution
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-zinc-950 font-black flex items-center justify-center text-xs">
                1
              </span>
              <span className="font-semibold text-zinc-100 text-xs">Open Zone in Cloudflare</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Navigate to your domain in the Cloudflare Dashboard (e.g. <code className="text-orange-400 font-mono text-[10px]">dash.cloudflare.com/:accountId/:domain</code>).
            </p>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-zinc-950 font-black flex items-center justify-center text-xs">
                2
              </span>
              <span className="font-semibold text-zinc-100 text-xs">Click Bookmark</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Click <strong>&quot;⚡ CatFlare CF Setup&quot;</strong> on your bookmarks bar. The modal will appear on top of Cloudflare and auto-detect your Domain &amp; Account ID.
            </p>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-zinc-950 font-black flex items-center justify-center text-xs">
                3
              </span>
              <span className="font-semibold text-zinc-100 text-xs">Click &quot;Run 1-Click Setup&quot;</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              CatFlare automatically clears old DNS records, adds Proxied @ &amp; www, sets SSL Strict, enables HTTPS, and adds the 301 redirect rule in 3 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Code Inspector Toggle */}
      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowCodePreview(!showCodePreview)}
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5 text-orange-400" />
          <span>{showCodePreview ? 'Hide JavaScript Code' : 'Inspect Bookmarklet JavaScript Code'}</span>
        </button>

        {onSwitchToSignup && (
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <span>Need to auto sign-up or lock Free Plan? Switch to Sign-Up tab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showCodePreview && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-72">
          <pre>{decodeURIComponent(bookmarkletCode.replace(/^javascript:/, ''))}</pre>
        </div>
      )}
    </div>
  );
};
