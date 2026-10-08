import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Terminal, 
  RefreshCw 
} from 'lucide-react';
import type { ProvisionStepLog } from '../types/provisioner';

interface LiveConsoleProps {
  logs: ProvisionStepLog[];
  isProvisioning: boolean;
  domain: string;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({ logs, isProvisioning, domain }) => {
  if (logs.length === 0 && !isProvisioning) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-xl mb-6 font-mono">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Provisioning Pipeline Engine &mdash; {domain || 'Ready'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isProvisioning && (
            <span className="flex items-center gap-1.5 text-xs text-orange-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </span>
          )}
          <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            Cloudflare v4 REST API
          </span>
        </div>
      </div>

      {/* Logs List */}
      <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto">
        {logs.map((log) => {
          let statusIcon = <Clock className="w-3.5 h-3.5 text-zinc-500" />;
          let statusColor = 'text-zinc-400';
          let borderAccent = 'border-l-zinc-700';

          if (log.status === 'in_progress') {
            statusIcon = <RefreshCw className="w-3.5 h-3.5 text-orange-400 animate-spin" />;
            statusColor = 'text-orange-300';
            borderAccent = 'border-l-orange-500';
          } else if (log.status === 'success') {
            statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
            statusColor = 'text-emerald-300';
            borderAccent = 'border-l-emerald-500';
          } else if (log.status === 'warning') {
            statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
            statusColor = 'text-amber-300';
            borderAccent = 'border-l-amber-500';
          } else if (log.status === 'error') {
            statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
            statusColor = 'text-rose-300';
            borderAccent = 'border-l-rose-500';
          }

          return (
            <div
              key={log.id}
              className={`p-2.5 rounded-r bg-zinc-900/60 border-l-2 ${borderAccent} text-xs flex items-start gap-2.5 transition-all`}
            >
              <div className="mt-0.5 flex-shrink-0">{statusIcon}</div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${statusColor}`}>{log.title}</span>
                  <span className="text-[10px] text-zinc-600">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {log.message && (
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {log.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
