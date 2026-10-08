import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  Download, 
  ExternalLink, 
  Trash2, 
  Copy, 
  Check, 
  Globe, 
  Server, 
  Mail, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import type { DomainRecord } from '../types/provisioner';
import { removeDomainFromVault } from '../services/storage';

interface DomainVaultProps {
  domains: DomainRecord[];
  onRefresh: () => void;
  onOpenDnsCheck: (domain: string) => void;
}

export const DomainVault: React.FC<DomainVaultProps> = ({
  domains,
  onRefresh,
  onOpenDnsCheck,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDomains = domains.filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      d.domain.toLowerCase().includes(term) ||
      d.serverIp.includes(term) ||
      (d.clientEmail && d.clientEmail.toLowerCase().includes(term))
    );
  });

  const handleDelete = (id: string, domain: string) => {
    if (confirm(`Remove ${domain} from the local Domain Vault?`)) {
      removeDomainFromVault(id);
      onRefresh();
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(domains, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cloudflare_domains_vault_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = ['Domain', 'cPanel IP', 'Client Email', 'SSL Mode', 'Created At'];
    const rows = domains.map((d) => [
      d.domain,
      d.serverIp,
      d.clientEmail || '',
      d.sslMode,
      d.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cloudflare_domains_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search domains, cPanel IP, or client email..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleExportCsv}
            disabled={domains.length === 0}
            className="px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={domains.length === 0}
            className="px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Domain Table */}
      {filteredDomains.length > 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 font-medium">
                <tr>
                  <th className="p-3.5">Domain</th>
                  <th className="p-3.5">cPanel IP</th>
                  <th className="p-3.5">DNS &amp; Proxy</th>
                  <th className="p-3.5">Client Email</th>
                  <th className="p-3.5">SSL / Origin</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredDomains.map((dom) => (
                  <tr key={dom.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-zinc-100">
                          {dom.domain}
                        </span>
                        {dom.isDemo && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                            demo
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-zinc-400">
                      {dom.serverIp}
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-0.5 text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <span>@ &rarr; {dom.serverIp}</span>
                          <span className="text-orange-400 font-bold">☁️</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <span>www &rarr; @</span>
                          <span className="text-orange-400 font-bold">☁️</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-zinc-400">
                      {dom.clientEmail || 'Master Account'}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] border border-emerald-500/20">
                          {dom.sslMode.toUpperCase()}
                        </span>
                        {dom.hasOriginCert && (
                          <span className="text-[10px] text-zinc-400" title="15-Year Origin CA Cert issued">
                            15-Yr Cert
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-zinc-500 text-[11px]">
                      {new Date(dom.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDnsCheck(dom.domain)}
                          title="Check live DNS status"
                          className="p-1.5 text-zinc-400 hover:text-orange-400 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(dom.id, dom.domain)}
                          title="Delete domain record"
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-500 mx-auto">
            <FolderArchive className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-zinc-200">No Domains Found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchTerm
              ? 'No domains matched your search criteria.'
              : 'Domains you provision will automatically appear here with their nameservers, cPanel IPs, and SSL status.'}
          </p>
        </div>
      )}
    </div>
  );
};
