import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, RefreshCw, Globe, ArrowRight } from 'lucide-react';
import { checkDomainDns } from '../services/api';

interface DnsCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDomain?: string;
}

export const DnsCheckerModal: React.FC<DnsCheckerModalProps> = ({
  isOpen,
  onClose,
  initialDomain = '',
}) => {
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    domain?: string;
    activeNameservers?: string[];
    activeIps?: string[];
    isPointingToCloudflare?: boolean;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domainInput.trim()) return;

    setLoading(true);
    setResult(null);

    const clean = domainInput.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const res = await checkDomainDns(clean);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                DNS &amp; Nameserver Propagation Checker
              </h2>
              <p className="text-xs text-zinc-400">
                Check whether your domain has switched to Cloudflare nameservers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleCheck} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="e.g. clientwebsite.com"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !domainInput.trim()}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check DNS</span>
                </>
              )}
            </button>
          </form>

          {/* Results */}
          {result && (
            <div className="space-y-4 pt-2">
              {result.success ? (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <span className="font-mono text-sm text-zinc-200">{result.domain}</span>
                    {result.isPointingToCloudflare ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pointed to Cloudflare!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Pending Registrar Update
                      </span>
                    )}
                  </div>

                  {/* Nameservers */}
                  <div>
                    <span className="text-xs text-zinc-400 font-medium block mb-1.5">
                      Active Nameservers (Resolved via Cloudflare 1.1.1.1):
                    </span>
                    {result.activeNameservers && result.activeNameservers.length > 0 ? (
                      <div className="space-y-1">
                        {result.activeNameservers.map((ns, idx) => (
                          <div
                            key={idx}
                            className="text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded border border-zinc-800/80 text-zinc-300 flex items-center justify-between"
                          >
                            <span>{ns}</span>
                            {ns.toLowerCase().includes('cloudflare.com') && (
                              <span className="text-[10px] text-orange-400">Cloudflare NS</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No NS records returned yet.</p>
                    )}
                  </div>

                  {/* Active IPs */}
                  {result.activeIps && result.activeIps.length > 0 && (
                    <div>
                      <span className="text-xs text-zinc-400 font-medium block mb-1">
                        Resolved A Records:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.activeIps.map((ip, i) => (
                          <span
                            key={i}
                            className="text-xs font-mono bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 text-zinc-300"
                          >
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-400 pt-1">
                    {result.isPointingToCloudflare ? (
                      <span className="text-emerald-400">
                        Traffic is routed through Cloudflare edge. DDoS protection, WAF, and SSL are active.
                      </span>
                    ) : (
                      <span>
                        Nameservers usually take between 5 minutes and 24 hours to propagate globally after updating at your domain registrar.
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3.5 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{result.error || 'Could not query DNS for this domain.'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
