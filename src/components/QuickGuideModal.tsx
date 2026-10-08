import React, { useState } from 'react';
import { X, ExternalLink, Check, Copy, Shield, Key, Server, Globe } from 'lucide-react';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: '1. Register Client Email on Cloudflare',
      badge: 'Takes 60 seconds',
      icon: Globe,
      content: (
        <div className="space-y-4 text-sm text-zinc-300">
          <p>
            Because Cloudflare protects registration with anti-bot CAPTCHAs, you (or your client) sign up the free account manually once:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-zinc-300 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
            <li>
              Go to <a href="https://dash.cloudflare.com/sign-up" target="_blank" rel="noreferrer" className="text-orange-400 underline inline-flex items-center gap-1">dash.cloudflare.com/sign-up <ExternalLink className="w-3 h-3" /></a>
            </li>
            <li>Enter your client&apos;s email and a password.</li>
            <li>Click <strong>Sign Up</strong> and verify the confirmation email in their inbox.</li>
            <li>
              <span className="text-amber-400 font-medium">Important:</span> You do <strong>not</strong> need to manually add the domain in the Cloudflare web wizard. Stop here! The Fast Provisioner will do everything else automatically.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 2,
      title: '2. Grab the API Key / Token',
      badge: 'Takes 30 seconds',
      icon: Key,
      content: (
        <div className="space-y-4 text-sm text-zinc-300">
          <p>
            You can use either the <strong>Global API Key</strong> (easiest for client accounts) or an <strong>API Token</strong>:
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-zinc-900/80 p-3.5 rounded-lg border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-100">Method A: Global API Key</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">Recommended for Client Accounts</span>
              </div>
              <p className="text-xs text-zinc-400">
                Works with Client Email. Gives instant access to create zones, records, and Origin SSL certificates without permission errors.
              </p>
              <ol className="text-xs space-y-1 list-decimal list-inside text-zinc-400">
                <li>Log into Cloudflare and click your user avatar (top-right).</li>
                <li>Go to <strong>My Profile &gt; API Tokens</strong>.</li>
                <li>Scroll to <strong>Global API Key</strong> and click <strong>View</strong>.</li>
              </ol>
              <a
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 underline pt-1"
              >
                Open Cloudflare API Tokens Page <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-zinc-900/80 p-3.5 rounded-lg border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-100">Method B: Scoped API Token</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">For Master Accounts</span>
              </div>
              <p className="text-xs text-zinc-400">
                Recommended if you are using your own agency master account for all client domains.
              </p>
              <ol className="text-xs space-y-1 list-decimal list-inside text-zinc-400">
                <li>Click <strong>Create Token</strong>.</li>
                <li>Choose the <strong>Edit zone DNS</strong> template (or All Zones: Edit).</li>
                <li>Copy the generated token string.</li>
              </ol>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: '3. 1-Click Fast Provisioner Does the Rest',
      badge: 'Takes 3 seconds',
      icon: Shield,
      content: (
        <div className="space-y-4 text-sm text-zinc-300">
          <p>
            Paste the credentials into the Fast Provisioner, type the domain (e.g. <code>myclient.com</code>) and your cPanel IP (e.g. <code>123.45.67.89</code>).
          </p>
          <div className="bg-zinc-900/70 p-4 rounded-lg border border-zinc-800 space-y-2">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              What the tool runs automatically in 1 single click:
            </span>
            <ul className="text-xs space-y-2 text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span><strong>Creates the Cloudflare Zone</strong> and assigns official nameservers.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span><strong>Adds Root A Record:</strong> <code>@</code> pointing to your cPanel IP with Proxy (☁️) enabled.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span><strong>Adds WWW Record:</strong> <code>www</code> pointing to root domain with Proxy (☁️) enabled.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span><strong>Configures SSL Mode:</strong> Sets Cloudflare SSL encryption to <strong>Full</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span><strong>Enables Always Use HTTPS:</strong> Automatically redirects all HTTP traffic to secure HTTPS.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span>
                <span><strong>Generates 15-Year Origin CA Certificate:</strong> Produces the CRT and Private Key for cPanel.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: '4. Paste Origin SSL into cPanel (No Server Access Needed)',
      badge: 'Solves SSL permanently',
      icon: Server,
      content: (
        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            Since you do not have root server access, standard Let&apos;s Encrypt in cPanel often fails behind Cloudflare. The <strong>15-Year Origin CA Certificate</strong> solves this completely!
          </p>
          <div className="bg-zinc-900/70 p-4 rounded-lg border border-zinc-800 space-y-3">
            <div className="space-y-2 text-xs text-zinc-300">
              <p><strong>Step-by-step cPanel Installation:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                <li>Log into your client&apos;s <strong>cPanel</strong>.</li>
                <li>Go to <strong>Security &gt; SSL/TLS</strong>.</li>
                <li>Click <strong>Install and Manage SSL for your site (HTTPS) &gt; Manage SSL Sites</strong>.</li>
                <li>Select the domain from the dropdown.</li>
                <li>
                  Click <strong>Copy Certificate (CRT)</strong> in our app &rarr; paste into <strong>Certificate: (CRT)</strong>.
                </li>
                <li>
                  Click <strong>Copy Private Key (KEY)</strong> in our app &rarr; paste into <strong>Private Key (KEY)</strong>.
                </li>
                <li>Leave the CA Bundle blank (not required for Cloudflare Origin CA).</li>
                <li>Click <strong>Install Certificate</strong>.</li>
              </ol>
            </div>
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              🎉 Done! The certificate is valid for 15 years. You will never have an expired SSL warning again, and Cloudflare Strict/Full SSL will work seamlessly without server root commands.
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Cloudflare &amp; cPanel Fast Provisioning Workflow
              </h2>
              <p className="text-xs text-zinc-400">
                How to onboard client domains in under 2 minutes without server root access
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

        {/* Step Tabs */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-900/20 px-6 overflow-x-auto">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeStep === s.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{s.title.split('.')[0]}</span>
              <span className="hidden sm:inline">. {s.title.split('.')[1]}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
            <h3 className="text-base font-medium text-zinc-100">
              {steps[activeStep - 1].title}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
              {steps[activeStep - 1].badge}
            </span>
          </div>

          {steps[activeStep - 1].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/40">
          <button
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className="px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous Step
          </button>

          <div className="text-xs text-zinc-500">
            Step {activeStep} of {steps.length}
          </div>

          {activeStep < steps.length ? (
            <button
              onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
              className="px-4 py-2 text-xs font-medium text-zinc-950 bg-orange-500 hover:bg-orange-400 rounded-lg transition-colors font-semibold shadow"
            >
              Next Step &rarr;
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-950 bg-orange-500 hover:bg-orange-400 rounded-lg transition-colors font-semibold shadow"
            >
              Start Provisioning
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
