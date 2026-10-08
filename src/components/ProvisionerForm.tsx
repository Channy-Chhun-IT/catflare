import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Server, 
  Globe, 
  Key, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Save,
  Sliders
} from 'lucide-react';
import type { CloudflareAuth, ProvisionOptions, SavedAccount } from '../types/provisioner';
import { getDefaultSettings, saveDefaultSettings, getSavedAccounts, saveAccount } from '../services/storage';

interface ProvisionerFormProps {
  onProvision: (auth: CloudflareAuth, options: ProvisionOptions, isDemo: boolean) => void;
  isProvisioning: boolean;
  masterAuth: CloudflareAuth | null;
  onOpenGuide: () => void;
  isDemoMode: boolean;
}

export const ProvisionerForm: React.FC<ProvisionerFormProps> = ({
  onProvision,
  isProvisioning,
  masterAuth,
  onOpenGuide,
  isDemoMode,
}) => {
  const [accountMode, setAccountMode] = useState<'client_account' | 'master_account'>(
    masterAuth ? 'master_account' : 'client_account'
  );

  // Client Account credentials
  const [clientEmail, setClientEmail] = useState('');
  const [clientKeyType, setClientKeyType] = useState<'global_key' | 'token'>('global_key');
  const [clientApiKey, setClientApiKey] = useState('');
  const [clientApiToken, setClientApiToken] = useState('');
  const [saveClientCredentials, setSaveClientCredentials] = useState(true);

  // Domain & Server IP
  const [domainInput, setDomainInput] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [ipSaveSuccess, setIpSaveSuccess] = useState(false);

  // Options
  const [proxyDns, setProxyDns] = useState(true);
  const [enableAlwaysHttps, setEnableAlwaysHttps] = useState(true);
  const [sslMode, setSslMode] = useState<'full' | 'strict' | 'flexible'>('full');
  const [generateOriginCert, setGenerateOriginCert] = useState(true);
  const [redirectTemplate, setRedirectTemplate] = useState<'www_to_root' | 'root_to_www'>('www_to_root');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load defaults from storage on mount
  useEffect(() => {
    const defaults = getDefaultSettings();
    if (defaults.defaultIp) {
      setServerIp(defaults.defaultIp);
    }
    setProxyDns(defaults.proxyDns);
    setEnableAlwaysHttps(defaults.enableAlwaysHttps);
    setSslMode(defaults.sslMode);
    setGenerateOriginCert(defaults.generateOriginCert);
  }, []);

  // Sanitize domain input (remove http/https/trailing slashes/www)
  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim().toLowerCase();
    val = val.replace(/^https?:\/\//, '');
    val = val.replace(/\/.*$/, '');
    val = val.replace(/^www\./, '');
    setDomainInput(val);
  };

  const handleSaveDefaultIp = () => {
    if (!serverIp.trim()) return;
    saveDefaultSettings({ defaultIp: serverIp.trim() });
    setIpSaveSuccess(true);
    setTimeout(() => setIpSaveSuccess(false), 2000);
  };

  const handleFillDemo = () => {
    setDomainInput('myshopclient' + Math.floor(Math.random() * 900 + 100) + '.com');
    setServerIp('198.51.100.54');
    setClientEmail('client' + Math.floor(Math.random() * 900 + 100) + '@agency.local');
    setClientApiKey('cf_demo_key_' + Math.random().toString(36).substring(2, 12));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim() || !serverIp.trim()) return;

    // Build auth
    let auth: CloudflareAuth;
    if (accountMode === 'master_account' && masterAuth) {
      auth = masterAuth;
    } else {
      auth = {
        authType: clientKeyType,
        email: clientEmail.trim(),
        globalApiKey: clientKeyType === 'global_key' ? clientApiKey.trim() : undefined,
        apiToken: clientKeyType === 'token' ? clientApiToken.trim() : undefined,
      };

      if (saveClientCredentials && clientEmail) {
        saveAccount({
          id: `acc_${Date.now()}`,
          label: `Client (${clientEmail})`,
          email: clientEmail.trim(),
          authType: clientKeyType,
          globalApiKey: clientKeyType === 'global_key' ? clientApiKey.trim() : undefined,
          apiToken: clientKeyType === 'token' ? clientApiToken.trim() : undefined,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const options: ProvisionOptions = {
      domain: domainInput.trim(),
      serverIp: serverIp.trim(),
      proxyDns,
      enableAlwaysHttps,
      sslMode,
      generateOriginCert,
      certValidityDays: 5475, // 15 years
      redirectTemplate,
    };

    onProvision(auth, options, isDemoMode);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Selection Banner */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-400" />
              <span>Cloudflare Account Mode</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Choose whether each domain has its own client email or uses your master account
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setAccountMode('client_account')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                accountMode === 'client_account'
                  ? 'bg-orange-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Per-Domain Client Email
            </button>
            <button
              type="button"
              onClick={() => setAccountMode('master_account')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                accountMode === 'master_account'
                  ? 'bg-orange-500 text-zinc-950 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Master Agency Account
            </button>
          </div>
        </div>

        {/* Client Account Form */}
        {accountMode === 'client_account' ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Client Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Client Cloudflare Email</span>
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    How to get in 60s
                  </button>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@clientdomain.com"
                    required={!isDemoMode}
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Key Type / Credentials */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">
                    {clientKeyType === 'global_key' ? 'Global API Key' : 'API Token'}
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setClientKeyType('global_key')}
                      className={`hover:underline ${clientKeyType === 'global_key' ? 'text-orange-400 font-medium' : 'text-zinc-500'}`}
                    >
                      Global Key (Recommended)
                    </button>
                    <span className="text-zinc-600">|</span>
                    <button
                      type="button"
                      onClick={() => setClientKeyType('token')}
                      className={`hover:underline ${clientKeyType === 'token' ? 'text-orange-400 font-medium' : 'text-zinc-500'}`}
                    >
                      Token
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  {clientKeyType === 'global_key' ? (
                    <input
                      type="password"
                      value={clientApiKey}
                      onChange={(e) => setClientApiKey(e.target.value)}
                      placeholder="Paste Global API Key"
                      required={!isDemoMode}
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  ) : (
                    <input
                      type="password"
                      value={clientApiToken}
                      onChange={(e) => setClientApiToken(e.target.value)}
                      placeholder="Paste API Token"
                      required={!isDemoMode}
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveClientCredentials}
                  onChange={(e) => setSaveClientCredentials(e.target.checked)}
                  className="rounded border-zinc-700 text-orange-500 focus:ring-0"
                />
                <span>Save client account credentials in Domain Vault</span>
              </label>

              <a
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-zinc-400 hover:text-orange-400 underline flex items-center gap-1"
              >
                Open Cloudflare API Tokens Page <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-150 p-4 bg-zinc-950/60 rounded-lg border border-zinc-800 space-y-2">
            {masterAuth ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-400">
                      Master Account Connected
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {masterAuth.email || 'Token Mode'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    All domains provisioned here will be automatically grouped into your primary Cloudflare dashboard.
                  </p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  Ready to Provision
                </span>
              </div>
            ) : (
              <div className="text-xs text-amber-400 flex items-center justify-between">
                <span>No Master Account configured yet. Go to Settings tab to connect your agency token.</span>
                <button
                  type="button"
                  onClick={() => setAccountMode('client_account')}
                  className="text-orange-400 underline text-xs ml-2"
                >
                  Use Client Account Mode
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Target Domain & cPanel IP Form */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-400" />
              <span>Target Website &amp; Server Details</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Only enter domain and cPanel IP &mdash; the engine will construct the zone, A record, and WWW alias
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>Load Example Values</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Domain Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Client Domain Name (Root)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={domainInput}
                onChange={handleDomainChange}
                placeholder="example.com"
                required
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Auto-creates <code>@</code> and <code>www.{domainInput || 'domain.com'}</code></span>
              <span className="text-emerald-400">Proxied ☁️</span>
            </div>
          </div>

          {/* cPanel IP */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                cPanel Server IP Address
              </label>
              <button
                type="button"
                onClick={handleSaveDefaultIp}
                className="text-[11px] text-zinc-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
                title="Save this IP as default for future domains"
              >
                {ipSaveSuccess ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Default Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    <span>Set as Default IP</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Server className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={serverIp}
                onChange={(e) => setServerIp(e.target.value.trim())}
                placeholder="e.g. 198.51.100.24"
                required
                pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}$"
                title="Please enter a valid IPv4 address (e.g. 192.0.2.1)"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Found in your cPanel sidebar under &quot;General Information &gt; Shared IP Address&quot;
            </p>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="pt-2 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>Automation &amp; SSL Settings</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </button>

          {showAdvanced && (
            <div className="grid sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-800/40 text-xs animate-in fade-in duration-150">
              <label className="flex items-start gap-2.5 bg-zinc-950 p-3 rounded-lg border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={proxyDns}
                  onChange={(e) => setProxyDns(e.target.checked)}
                  className="rounded border-zinc-700 text-orange-500 focus:ring-0 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-zinc-200 block">
                    Cloudflare Proxy (Orange Cloud ☁️)
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Hides cPanel IP and provides DDoS, WAF, and CDN caching
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 bg-zinc-950 p-3 rounded-lg border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAlwaysHttps}
                  onChange={(e) => setEnableAlwaysHttps(e.target.checked)}
                  className="rounded border-zinc-700 text-orange-500 focus:ring-0 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-zinc-200 block">
                    Always Use HTTPS Redirect
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Automatically forces all http:// visitors to https://
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 bg-zinc-950 p-3 rounded-lg border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateOriginCert}
                  onChange={(e) => setGenerateOriginCert(e.target.checked)}
                  className="rounded border-zinc-700 text-orange-500 focus:ring-0 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-zinc-200 block">
                    Generate 15-Year Origin CA Certificate
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Creates CRT and Private Key for cPanel SSL Manager
                  </span>
                </div>
              </label>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
                <span className="font-semibold text-zinc-200 block">
                  Cloudflare SSL/TLS Encryption Mode
                </span>
                <select
                  value={sslMode}
                  onChange={(e) => setSslMode(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value="full">Full (Standard with Origin Cert)</option>
                  <option value="strict">Full (Strict)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
                <span className="font-semibold text-zinc-200 block">
                  Redirect Option
                </span>
                <select
                  value={redirectTemplate}
                  onChange={(e) => setRedirectTemplate(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-200 text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value="www_to_root">force root</option>
                  <option value="root_to_www">forece www</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isProvisioning || !domainInput.trim() || !serverIp.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>
              {isProvisioning
                ? 'Provisioning Zone & Configuring DNS...'
                : isDemoMode
                ? 'Run 1-Click Simulation (Demo Mode)'
                : 'Run 1-Click Automated Setup 🚀'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};
