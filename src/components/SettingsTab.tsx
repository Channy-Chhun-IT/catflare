import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Save, 
  Trash2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import type { CloudflareAuth, SavedAccount } from '../types/provisioner';
import { 
  getMasterAuth, 
  saveMasterAuth, 
  getDefaultSettings, 
  saveDefaultSettings, 
  getSavedAccounts, 
  deleteSavedAccount 
} from '../services/storage';
import { verifyCloudflareAuth } from '../services/api';

interface SettingsTabProps {
  onMasterAuthChange: (auth: CloudflareAuth | null) => void;
  isDemoMode: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onMasterAuthChange, isDemoMode }) => {
  // Master Auth State
  const [authType, setAuthType] = useState<'token' | 'global_key'>('token');
  const [apiToken, setApiToken] = useState('');
  const [email, setEmail] = useState('');
  const [globalApiKey, setGlobalApiKey] = useState('');
  const [accountId, setAccountId] = useState('');

  // Verification state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    email?: string;
    accountId?: string;
    accounts?: Array<{ id: string; name: string }>;
    error?: string;
  } | null>(null);

  // Defaults
  const [defaultIp, setDefaultIp] = useState('');
  const [sslMode, setSslMode] = useState<'full' | 'strict' | 'flexible'>('full');
  const [proxyDns, setProxyDns] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Client accounts list
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    const existing = getMasterAuth();
    if (existing) {
      setAuthType(existing.authType || 'token');
      setApiToken(existing.apiToken || '');
      setEmail(existing.email || '');
      setGlobalApiKey(existing.globalApiKey || '');
      setAccountId(existing.accountId || '');
    }

    const defaults = getDefaultSettings();
    setDefaultIp(defaults.defaultIp || '');
    setSslMode(defaults.sslMode || 'full');
    setProxyDns(defaults.proxyDns !== false);

    setSavedAccounts(getSavedAccounts());
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const auth: CloudflareAuth = {
      authType,
      apiToken: authType === 'token' ? apiToken.trim() : undefined,
      email: authType === 'global_key' ? email.trim() : undefined,
      globalApiKey: authType === 'global_key' ? globalApiKey.trim() : undefined,
      accountId: accountId.trim() || undefined,
    };

    const res = await verifyCloudflareAuth(auth, isDemoMode);
    setTestResult(res);
    setIsTesting(false);

    if (res.success && res.accountId && !accountId) {
      setAccountId(res.accountId);
    }
  };

  const handleSaveMasterAuth = (e: React.FormEvent) => {
    e.preventDefault();

    const auth: CloudflareAuth = {
      authType,
      apiToken: authType === 'token' ? apiToken.trim() : undefined,
      email: authType === 'global_key' ? email.trim() : undefined,
      globalApiKey: authType === 'global_key' ? globalApiKey.trim() : undefined,
      accountId: accountId.trim() || undefined,
    };

    saveMasterAuth(auth);
    onMasterAuthChange(auth);

    saveDefaultSettings({
      defaultIp: defaultIp.trim(),
      sslMode,
      proxyDns,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteSavedAccount = (id: string) => {
    deleteSavedAccount(id);
    setSavedAccounts(getSavedAccounts());
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Master Account Configuration */}
      <form onSubmit={handleSaveMasterAuth} className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-400" />
              <span>Master Cloudflare Credentials</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Saved securely in your browser session for 1-click domain provisioning
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setAuthType('token')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                authType === 'token' ? 'bg-orange-500 text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              API Token (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setAuthType('global_key')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                authType === 'global_key' ? 'bg-orange-500 text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              Global API Key
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        {authType === 'token' ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Cloudflare API Token
                </label>
                <a
                  href="https://dash.cloudflare.com/profile/api-tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
                >
                  Create Token on Cloudflare <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Bearer Token with Zone:Edit and DNS:Edit permissions"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">
                Template: Select &quot;Edit zone DNS&quot; or provide custom permissions (Zone:Edit, DNS:Edit, SSL and Certificates:Edit).
              </p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Cloudflare Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@agency.com"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  Global API Key
                </label>
                <a
                  href="https://dash.cloudflare.com/profile/api-tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-orange-400 hover:underline flex items-center gap-1"
                >
                  View Global Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={globalApiKey}
                onChange={(e) => setGlobalApiKey(e.target.value)}
                placeholder="Global API Key from profile"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>
        )}

        {/* Account ID (optional, auto-detected) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
            <span>Cloudflare Account ID (Optional / Auto-detected)</span>
            <span className="text-[11px] text-zinc-500">
              Found on your Cloudflare Overview sidebar
            </span>
          </label>
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value.trim())}
            placeholder="e.g. 5d1e2f9810a9c84e1b..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono"
          />
        </div>

        {/* Verification Status Banner */}
        {testResult && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-semibold block">
                {testResult.success ? 'Authentication Verified Successfully!' : 'Authentication Failed'}
              </span>
              <p className="text-[11px] opacity-90">
                {testResult.success
                  ? `Connected to ${testResult.email || 'Cloudflare'}. ${
                      testResult.accounts && testResult.accounts.length > 0
                        ? `Found accounts: ${testResult.accounts.map((a) => a.name).join(', ')}`
                        : ''
                    }`
                  : testResult.error}
              </p>
            </div>
          </div>
        )}

        {/* Default Values */}
        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-orange-400" />
            <span>Default Provisioning Values</span>
          </h4>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Default cPanel Server IP
              </label>
              <input
                type="text"
                value={defaultIp}
                onChange={(e) => setDefaultIp(e.target.value.trim())}
                placeholder="e.g. 198.51.100.24"
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Default SSL/TLS Mode
              </label>
              <select
                value={sslMode}
                onChange={(e) => setSslMode(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-3.5 py-2 text-xs text-zinc-100"
              >
                <option value="full">Full (Standard for cPanel + Origin SSL)</option>
                <option value="strict">Full (Strict)</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Testing API...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Master Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Saved Client Accounts */}
      {savedAccounts.length > 0 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">
            Saved Client Accounts
          </h3>
          <p className="text-xs text-zinc-400">
            Client credentials cached locally for re-provisioning or updating DNS:
          </p>
          <div className="space-y-2">
            {savedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-zinc-200 block">{acc.label}</span>
                  <span className="text-zinc-500 font-mono text-[11px]">{acc.email}</span>
                </div>
                <button
                  onClick={() => handleDeleteSavedAccount(acc.id)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                  title="Remove saved account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
