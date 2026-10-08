import type { CloudflareAuth, ProvisionOptions, ProvisionResult } from '../types/provisioner';

export async function verifyCloudflareAuth(
  auth: CloudflareAuth,
  isDemo = false
): Promise<{ success: boolean; email?: string; accountId?: string; accounts?: Array<{ id: string; name: string }>; error?: string }> {
  try {
    const res = await fetch('/api/cloudflare/verify-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth, isDemo }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to API proxy',
    };
  }
}

export async function provisionCloudflareDomain(
  auth: CloudflareAuth,
  options: ProvisionOptions,
  isDemo = false
): Promise<{ success: boolean; result?: ProvisionResult; error?: string; logs?: any[] }> {
  try {
    const res = await fetch('/api/cloudflare/provision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth,
        domain: options.domain,
        serverIp: options.serverIp,
        proxyDns: options.proxyDns,
        enableAlwaysHttps: options.enableAlwaysHttps,
        sslMode: options.sslMode,
        generateOriginCert: options.generateOriginCert,
        certValidityDays: options.certValidityDays,
        redirectTemplate: options.redirectTemplate,
        isDemo,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Provisioning request failed',
    };
  }
}

export async function checkDomainDns(
  domain: string
): Promise<{
  success: boolean;
  domain?: string;
  activeNameservers?: string[];
  activeIps?: string[];
  isPointingToCloudflare?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/api/cloudflare/dns-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    });

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'DNS query failed',
    };
  }
}
