import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  ShieldCheck, 
  Server, 
  Mail, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import type { ProvisionResult } from '../types/provisioner';

interface ProvisionResultProps {
  result: ProvisionResult;
  onReset: () => void;
  onOpenGuide: () => void;
}

export const ProvisionResultCard: React.FC<ProvisionResultProps> = ({
  result,
  onReset,
  onOpenGuide,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const clientEmailTemplate = `Hello,

We have completed the Cloudflare setup for your domain (${result.domain}).

Configuration applied:
- Root A (@) & WWW records proxied through Cloudflare edge (IP: ${result.serverIp})
- SSL/TLS Encryption: Full (Strict)
- Always Use HTTPS: Enabled
- 301 Redirect Rule: Active

Your domain is protected and ready!

Thank you!`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Top Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-100">
                Domain Successfully Provisioned!
              </h3>
              {result.isDemo && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Demo Run
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Zone linked, DNS configured, SSL mode set to Full, and Origin CA cert generated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => copyToClipboard(clientEmailTemplate, 'client_email')}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            {copiedKey === 'client_email' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Email!</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-orange-400" />
                <span>Copy Client Handover Note</span>
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold rounded-lg text-xs transition-colors shadow"
          >
            + Provision Another
          </button>
        </div>
      </div>

      {/* Primary 2-Column Grid: Nameservers & cPanel SSL */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Edge & Routing Configuration */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-semibold text-zinc-100">
                1. Edge &amp; DNS Routing Status
              </h4>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              {result.domain}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Root Host (@):</span>
              <span className="font-mono text-zinc-200">{result.serverIp} <strong className="text-orange-400">(Proxied ☁️)</strong></span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <span className="text-zinc-400">WWW Alias (www):</span>
              <span className="font-mono text-zinc-200">{result.domain} <strong className="text-orange-400">(Proxied ☁️)</strong></span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <span className="text-zinc-400">SSL/TLS Mode:</span>
              <span className="font-semibold text-emerald-400">Full (Strict)</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Always Use HTTPS:</span>
              <span className="font-semibold text-emerald-400">Enabled (301)</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Info className="w-3 h-3 text-orange-400" />
              <span>DDoS &amp; WAF Protection Active</span>
            </div>
            <p>
              Direct traffic to cPanel IP is shielded behind Cloudflare reverse proxy with automatic SSL enforcement.
            </p>
          </div>
        </div>

        {/* Card 2: 15-Year Origin CA SSL for cPanel */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-zinc-100">
                2. Install SSL into cPanel
              </h4>
            </div>
            <button
              onClick={onOpenGuide}
              className="text-xs text-orange-400 hover:underline flex items-center gap-1"
            >
              cPanel Guide <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            Paste these into cPanel <strong>SSL/TLS &gt; Install an SSL Website</strong>. Valid for 15 years with zero server command line:
          </p>

          {result.originCert ? (
            <div className="space-y-2.5">
              {/* Certificate */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    Certificate (CRT)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.originCert!.certificate, 'cert')}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
                  >
                    {copiedKey === 'cert' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy CRT</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[10px] text-zinc-400 bg-zinc-900 p-2 rounded truncate">
                  {result.originCert.certificate.slice(0, 60)}...
                </div>
              </div>

              {/* Private Key */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">
                    Private Key (KEY)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.originCert!.privateKey || '', 'key')}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors"
                  >
                    {copiedKey === 'key' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy KEY</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[10px] text-zinc-400 bg-zinc-900 p-2 rounded truncate">
                  {result.originCert.privateKey ? result.originCert.privateKey.slice(0, 60) + '...' : 'Key embedded in certificate request'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
              <p className="text-amber-400 font-medium">Automatic Origin CA cert skipped or limited by token scope.</p>
              <p>
                To generate in Cloudflare Dashboard: Go to <strong>SSL/TLS &gt; Origin Server &gt; Create Certificate</strong> (1-click, 15 years validity).
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
            <span>SSL Mode: <strong className="text-zinc-300">{result.sslMode.toUpperCase()}</strong></span>
            <span>Always HTTPS: <strong className="text-emerald-400">Enabled</strong></span>
          </div>
        </div>
      </div>

      {/* DNS Records Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h4 className="text-sm font-semibold text-zinc-200">
          Configured DNS Records on Cloudflare
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Content (Points To)</th>
                <th className="p-2.5">Proxy Status</th>
                <th className="p-2.5">TTL</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {result.dnsRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-zinc-850/50">
                  <td className="p-2.5 font-bold text-orange-400">{rec.type}</td>
                  <td className="p-2.5 text-zinc-200">{rec.name}</td>
                  <td className="p-2.5 text-zinc-300">{rec.content}</td>
                  <td className="p-2.5">
                    {rec.proxied ? (
                      <span className="text-orange-400 flex items-center gap-1">
                        ☁️ Proxied
                      </span>
                    ) : (
                      <span className="text-zinc-500">DNS Only</span>
                    )}
                  </td>
                  <td className="p-2.5 text-zinc-500">Auto</td>
                  <td className="p-2.5">
                    <span className="text-emerald-400 text-[11px]">
                      {rec.status === 'created' ? 'Created' : 'Configured'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
