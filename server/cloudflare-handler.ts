import type { IncomingMessage, ServerResponse } from 'http';

interface CloudflareAuth {
  authType?: 'token' | 'global_key';
  apiToken?: string;
  email?: string;
  globalApiKey?: string;
  accountId?: string;
  originCaKey?: string;
}

interface ProvisionPayload {
  auth: CloudflareAuth;
  domain: string;
  serverIp: string;
  proxyDns?: boolean;
  enableAlwaysHttps?: boolean;
  sslMode?: 'full' | 'strict' | 'flexible';
  generateOriginCert?: boolean;
  certValidityDays?: number;
  isDemo?: boolean;
}

function getAuthHeaders(auth: CloudflareAuth): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth.apiToken && auth.apiToken.trim() !== '') {
    headers['Authorization'] = `Bearer ${auth.apiToken.trim()}`;
  } else if (auth.email && auth.globalApiKey) {
    headers['X-Auth-Email'] = auth.email.trim();
    headers['X-Auth-Key'] = auth.globalApiKey.trim();
  }

  return headers;
}

function getOriginCertHeaders(auth: CloudflareAuth): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth.originCaKey && auth.originCaKey.trim() !== '') {
    headers['X-Auth-User-Service-Key'] = auth.originCaKey.trim();
  } else if (auth.email && auth.globalApiKey) {
    headers['X-Auth-Email'] = auth.email.trim();
    headers['X-Auth-Key'] = auth.globalApiKey.trim();
  } else if (auth.apiToken) {
    headers['Authorization'] = `Bearer ${auth.apiToken.trim()}`;
  }

  return headers;
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', (err) => reject(err));
  });
}

function sendJsonResponse(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Generate a realistic mock/demo response when user tests with Demo mode
function generateDemoResult(payload: ProvisionPayload) {
  const cleanDomain = payload.domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const nsList = ['adam.ns.cloudflare.com', 'claire.ns.cloudflare.com'];
  
  return {
    id: `prov_demo_${Date.now()}`,
    domain: cleanDomain,
    serverIp: payload.serverIp,
    zoneId: 'demo_zone_' + Math.random().toString(36).substring(2, 10),
    accountEmail: payload.auth.email || 'demo-client@agency.local',
    nameservers: nsList,
    dnsRecords: [
      {
        type: 'A',
        name: '@',
        content: payload.serverIp,
        proxied: payload.proxyDns !== false,
        id: 'rec_demo_a_1',
        status: 'created',
      },
      {
        type: 'CNAME',
        name: 'www',
        content: cleanDomain,
        proxied: payload.proxyDns !== false,
        id: 'rec_demo_cname_1',
        status: 'created',
      },
    ],
    sslMode: payload.sslMode || 'full',
    alwaysHttpsEnabled: payload.enableAlwaysHttps !== false,
    originCert: payload.generateOriginCert !== false ? {
      certificate: `-----BEGIN CERTIFICATE-----\nMIIDzTCCArWgAwIBAgIU${Buffer.from(cleanDomain).toString('base64').substring(0, 32)}...\n[DEMO ORIGIN CA CERTIFICATE FOR ${cleanDomain} AND *.${cleanDomain}]\n-----END CERTIFICATE-----`,
      privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n[DEMO RSA PRIVATE KEY FOR cPanel SSL/TLS]\n-----END PRIVATE KEY-----`,
      expiresOn: new Date(Date.now() + (payload.certValidityDays || 5475) * 86400000).toISOString(),
      hostnames: [cleanDomain, `*.${cleanDomain}`],
    } : undefined,
    createdAt: new Date().toISOString(),
    isDemo: true,
    logs: [
      { id: '1', title: 'Authenticate with Cloudflare', status: 'success', message: 'Demo credentials verified.', timestamp: Date.now() },
      { id: '2', title: 'Connect to Existing Zone', status: 'success', message: `Connected to existing domain: ${cleanDomain}`, timestamp: Date.now() },
      { id: '3', title: 'Remove Existing DNS Records', status: 'success', message: 'Removed all existing DNS records before creating new records.', timestamp: Date.now() },
      { id: '4', title: 'Add Root A Record (@)', status: 'success', message: `@ pointing to ${payload.serverIp} (Proxied ☁️)`, timestamp: Date.now() },
      { id: '5', title: 'Add WWW CNAME Record (www)', status: 'success', message: `www pointing to ${cleanDomain} (Proxied ☁️)`, timestamp: Date.now() },
      { id: '6', title: 'Configure SSL/TLS Mode', status: 'success', message: `SSL mode configured to STRICT with Always Use HTTPS enabled.`, timestamp: Date.now() },
      { id: '7', title: 'Apply Wildcard Redirect Template', status: 'success', message: `Applied wildcard template: "${(payload as any).redirectTemplate === 'root_to_www' ? 'Redirect from root to WWW [Template]' : 'Redirect from WWW to root [Template]'}" (301 redirect).`, timestamp: Date.now() },
      { id: '8', title: 'Generate Origin CA Certificate', status: 'success', message: '15-Year Origin CA certificate created ready for cPanel.', timestamp: Date.now() },
    ],
  };
}

export async function handleCloudflareRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api/cloudflare')) {
    return false;
  }

  try {
    // 1. VERIFY AUTH
    if (url === '/api/cloudflare/verify-auth' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const { auth, isDemo } = JSON.parse(body || '{}');

      if (isDemo) {
        sendJsonResponse(res, 200, {
          success: true,
          email: 'demo-client@agency.local',
          accountId: 'demo_acc_12345',
          accounts: [{ id: 'demo_acc_12345', name: 'Demo Agency Account' }],
          isDemo: true,
        });
        return true;
      }

      if (!auth || (!auth.apiToken && (!auth.email || !auth.globalApiKey))) {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'Please provide either an API Token or both Email & Global API Key.',
        });
        return true;
      }

      const headers = getAuthHeaders(auth);

      // Verify token or key
      let emailFound = auth.email;
      let accountId = auth.accountId;
      let accounts: Array<{ id: string; name: string }> = [];

      if (auth.apiToken) {
        const verifyResp = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
          headers,
        });
        const verifyData = await verifyResp.json() as any;
        if (!verifyData.success) {
          sendJsonResponse(res, 401, {
            success: false,
            error: verifyData.errors?.[0]?.message || 'Invalid API Token.',
          });
          return true;
        }
      } else {
        const userResp = await fetch('https://api.cloudflare.com/client/v4/user', {
          headers,
        });
        const userData = await userResp.json() as any;
        if (!userData.success) {
          sendJsonResponse(res, 401, {
            success: false,
            error: userData.errors?.[0]?.message || 'Invalid Email or Global API Key.',
          });
          return true;
        }
        emailFound = userData.result?.email || emailFound;
      }

      // Fetch accounts associated with this credential
      try {
        const accResp = await fetch('https://api.cloudflare.com/client/v4/accounts?per_page=20', {
          headers,
        });
        const accData = await accResp.json() as any;
        if (accData.success && Array.isArray(accData.result) && accData.result.length > 0) {
          accounts = accData.result.map((a: any) => ({ id: a.id, name: a.name }));
          if (!accountId) {
            accountId = accounts[0].id;
          }
        }
      } catch (err) {
        console.warn('Could not list accounts:', err);
      }

      sendJsonResponse(res, 200, {
        success: true,
        email: emailFound,
        accountId: accountId || null,
        accounts,
      });
      return true;
    }

    // 2. DNS LOOKUP / VERIFY STATUS
    if (url === '/api/cloudflare/dns-check' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const { domain } = JSON.parse(body || '{}');

      if (!domain) {
        sendJsonResponse(res, 400, { success: false, error: 'Domain is required' });
        return true;
      }

      const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

      try {
        // Query NS records via Cloudflare DoH
        const dohResp = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=NS`, {
          headers: { Accept: 'application/dns-json' },
        });
        const dohData = await dohResp.json() as any;

        const nsRecords = (dohData.Answer || [])
          .filter((a: any) => a.type === 2)
          .map((a: any) => a.data?.replace(/\.$/, ''));

        // Query A records
        const aResp = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=A`, {
          headers: { Accept: 'application/dns-json' },
        });
        const aData = await aResp.json() as any;
        const aRecords = (aData.Answer || [])
          .filter((a: any) => a.type === 1)
          .map((a: any) => a.data);

        const isPointingToCloudflare = nsRecords.some((ns: string) => ns.toLowerCase().includes('cloudflare.com'));

        sendJsonResponse(res, 200, {
          success: true,
          domain: cleanDomain,
          activeNameservers: nsRecords,
          activeIps: aRecords,
          isPointingToCloudflare,
        });
        return true;
      } catch (err: any) {
        sendJsonResponse(res, 500, {
          success: false,
          error: err.message || 'DNS lookup failed',
        });
        return true;
      }
    }

    // 3. FULL PROVISIONING ENDPOINT
    if (url === '/api/cloudflare/provision' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const payload = JSON.parse(body || '{}') as ProvisionPayload;

      if (!payload.domain || !payload.serverIp) {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'Domain and Server IP are required.',
        });
        return true;
      }

      const cleanDomain = payload.domain
        .toLowerCase()
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/:\d+$/, '');

      // Check if demo mode requested
      if (payload.isDemo) {
        const demoResult = generateDemoResult({
          ...payload,
          domain: cleanDomain,
        });
        sendJsonResponse(res, 200, { success: true, result: demoResult });
        return true;
      }

      const logs: any[] = [];
      const headers = getAuthHeaders(payload.auth);

      // Check account ID
      let accountId = payload.auth.accountId;
      if (!accountId) {
        logs.push({
          id: 'acc_detect',
          title: 'Detect Account ID',
          status: 'in_progress',
          timestamp: Date.now(),
        });
        const accResp = await fetch('https://api.cloudflare.com/client/v4/accounts?per_page=10', {
          headers,
        });
        const accData = await accResp.json() as any;
        if (accData.success && accData.result?.length > 0) {
          accountId = accData.result[0].id;
          logs[logs.length - 1].status = 'success';
          logs[logs.length - 1].message = `Using Cloudflare Account: ${accData.result[0].name} (${accountId})`;
        } else {
          logs[logs.length - 1].status = 'error';
          logs[logs.length - 1].message = 'No Cloudflare Account ID found. Please specify Account ID.';
          sendJsonResponse(res, 400, {
            success: false,
            error: 'Could not auto-detect Cloudflare Account ID. Please verify permissions or provide Account ID in settings.',
            logs,
          });
          return true;
        }
      }

      // Step A: Connect to existing Zone (do not re-assign or re-create)
      let zoneId = '';
      let nameservers: string[] = [];

      logs.push({
        id: 'zone_link',
        title: 'Connect to Existing Zone',
        status: 'in_progress',
        timestamp: Date.now(),
      });

      const getZoneResp = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(cleanDomain)}`, {
        headers,
      });
      const getZoneData = await getZoneResp.json() as any;

      if (getZoneData.success && getZoneData.result?.length > 0) {
        zoneId = getZoneData.result[0].id;
        nameservers = getZoneData.result[0].name_servers || [];
        logs[logs.length - 1].status = 'success';
        logs[logs.length - 1].message = `Connected to existing zone: ${cleanDomain} (${zoneId})`;
      } else {
        logs[logs.length - 1].status = 'error';
        logs[logs.length - 1].message = `Domain "${cleanDomain}" was not found in this Cloudflare account. Please ensure it is already added to this account.`;
        sendJsonResponse(res, 404, {
          success: false,
          error: `Domain "${cleanDomain}" was not found in this Cloudflare account. Please make sure the domain is already assigned to this account first.`,
          logs,
        });
        return true;
      }

      // Step B: Configure DNS Records
      const dnsResults: any[] = [];
      const proxySetting = payload.proxyDns !== false;

      // 1. Remove ALL existing DNS records first before creating new records
      logs.push({
        id: 'dns_cleanup',
        title: 'Remove Existing DNS Records',
        status: 'in_progress',
        timestamp: Date.now(),
      });

      let totalRemovedDns = 0;
      let hasMoreDnsRecords = true;
      while (hasMoreDnsRecords) {
        const listDnsResp = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=100`,
          { headers }
        );
        const listDnsData = (await listDnsResp.json()) as any;
        if (listDnsData.success && Array.isArray(listDnsData.result) && listDnsData.result.length > 0) {
          for (const rec of listDnsData.result) {
            await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${rec.id}`, {
              method: 'DELETE',
              headers,
            });
            totalRemovedDns++;
          }
        } else {
          hasMoreDnsRecords = false;
        }
      }

      logs[logs.length - 1].status = 'success';
      logs[logs.length - 1].message = totalRemovedDns > 0
        ? `Removed all ${totalRemovedDns} existing DNS record(s) before creating new records.`
        : 'No prior DNS records found on this domain.';

      // 2. Create clean Root A Record (@)
      logs.push({
        id: 'dns_a_record',
        title: 'Add Fresh Root A Record (@)',
        status: 'in_progress',
        timestamp: Date.now(),
      });

      const createAResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'A',
          name: '@',
          content: payload.serverIp,
          ttl: 1,
          proxied: proxySetting,
          comment: 'cPanel Host - Fast Provisioner',
        }),
      });
      const createAData = await createAResp.json() as any;
      if (createAData.success) {
        dnsResults.push({
          type: 'A',
          name: '@',
          content: payload.serverIp,
          proxied: proxySetting,
          id: createAData.result.id,
          status: 'created',
        });
        logs[logs.length - 1].status = 'success';
        logs[logs.length - 1].message = `Created root A record pointing to ${payload.serverIp} (${proxySetting ? 'Proxied ☁️' : 'DNS Only'})`;
      } else {
        logs[logs.length - 1].status = 'error';
        logs[logs.length - 1].message = createAData.errors?.[0]?.message || 'Failed to create A record';
      }

      // 2. WWW CNAME Record (www -> root)
      logs.push({
        id: 'dns_cname_record',
        title: 'Add WWW CNAME Record (www)',
        status: 'in_progress',
        timestamp: Date.now(),
      });

      const checkCnameResp = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent('www.' + cleanDomain)}`,
        { headers }
      );
      const checkCnameData = await checkCnameResp.json() as any;

      if (checkCnameData.success && checkCnameData.result?.length > 0) {
        const existingCname = checkCnameData.result[0];
        const updateCnameResp = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existingCname.id}`,
          {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              type: 'CNAME',
              name: 'www',
              content: cleanDomain,
              ttl: 1,
              proxied: proxySetting,
              comment: 'WWW Alias - Updated via Fast Provisioner',
            }),
          }
        );
        const updateCnameData = await updateCnameResp.json() as any;
        if (updateCnameData.success) {
          dnsResults.push({
            type: 'CNAME',
            name: 'www',
            content: cleanDomain,
            proxied: proxySetting,
            id: existingCname.id,
            status: 'updated',
          });
          logs[logs.length - 1].status = 'success';
          logs[logs.length - 1].message = `Updated www CNAME to ${cleanDomain} (${proxySetting ? 'Proxied ☁️' : 'DNS Only'})`;
        } else {
          logs[logs.length - 1].status = 'warning';
          logs[logs.length - 1].message = updateCnameData.errors?.[0]?.message || 'Could not update www CNAME';
        }
      } else {
        const createCnameResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'CNAME',
            name: 'www',
            content: cleanDomain,
            ttl: 1,
            proxied: proxySetting,
            comment: 'WWW Alias - Fast Provisioner',
          }),
        });
        const createCnameData = await createCnameResp.json() as any;
        if (createCnameData.success) {
          dnsResults.push({
            type: 'CNAME',
            name: 'www',
            content: cleanDomain,
            proxied: proxySetting,
            id: createCnameData.result.id,
            status: 'created',
          });
          logs[logs.length - 1].status = 'success';
          logs[logs.length - 1].message = `Created www CNAME pointing to ${cleanDomain} (${proxySetting ? 'Proxied ☁️' : 'DNS Only'})`;
        } else {
          logs[logs.length - 1].status = 'warning';
          logs[logs.length - 1].message = createCnameData.errors?.[0]?.message || 'Could not create www CNAME';
        }
      }

      // Step C: SSL/TLS Mode Settings
      const sslMode = payload.sslMode || 'full';
      logs.push({
        id: 'ssl_setting',
        title: 'Configure SSL/TLS Encryption Mode',
        status: 'in_progress',
        timestamp: Date.now(),
      });

      try {
        const patchSslResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ssl`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ value: sslMode }),
        });
        const patchSslData = await patchSslResp.json() as any;
        if (patchSslData.success) {
          logs[logs.length - 1].status = 'success';
          logs[logs.length - 1].message = `SSL/TLS encryption set to "${sslMode.toUpperCase()}".`;
        } else {
          logs[logs.length - 1].status = 'warning';
          logs[logs.length - 1].message = `Notice: ${patchSslData.errors?.[0]?.message || 'Could not set SSL mode'}`;
        }
      } catch (err: any) {
        logs[logs.length - 1].status = 'warning';
        logs[logs.length - 1].message = `SSL setting patch error: ${err.message}`;
      }

      // Step D: Always Use HTTPS
      if (payload.enableAlwaysHttps !== false) {
        logs.push({
          id: 'always_https',
          title: 'Enable Always Use HTTPS',
          status: 'in_progress',
          timestamp: Date.now(),
        });

        try {
          const patchHttpsResp = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/always_use_https`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ value: 'on' }),
            }
          );
          const patchHttpsData = await patchHttpsResp.json() as any;
          if (patchHttpsData.success) {
            logs[logs.length - 1].status = 'success';
            logs[logs.length - 1].message = 'HTTP to HTTPS automatic redirection enabled.';
          } else {
            logs[logs.length - 1].status = 'warning';
            logs[logs.length - 1].message = patchHttpsData.errors?.[0]?.message || 'Could not toggle Always Use HTTPS';
          }
        } catch (err: any) {
          logs[logs.length - 1].status = 'warning';
          logs[logs.length - 1].message = `Always HTTPS error: ${err.message}`;
        }
      }

      // Step D2: Official Cloudflare Wildcard Template (matches Image 2)
      const redirectChoice = (payload as any).redirectTemplate || 'www_to_root';
      if (redirectChoice === 'www_to_root' || redirectChoice === 'root_to_www') {
        const isWwwToRoot = redirectChoice === 'www_to_root';
        const templateName = isWwwToRoot ? 'Redirect from WWW to root [Template]' : 'Redirect from root to WWW [Template]';
        const ruleExpression = isWwwToRoot
          ? `(http.request.full_uri wildcard "https://www.${cleanDomain}/*")`
          : `(http.request.full_uri wildcard "https://${cleanDomain}/*")`;
        const targetUrlExpr = isWwwToRoot
          ? `wildcard_replace(http.request.full_uri, "https://www.${cleanDomain}/*", "https://${cleanDomain}/\${1}")`
          : `wildcard_replace(http.request.full_uri, "https://${cleanDomain}/*", "https://www.${cleanDomain}/\${1}")`;

        logs.push({
          id: 'redirect_rule',
          title: `Apply Wildcard Template: ${templateName}`,
          status: 'in_progress',
          timestamp: Date.now(),
        });

        try {
          const targetRule = {
            description: templateName,
            expression: ruleExpression,
            action: 'redirect',
            action_parameters: {
              from_value: {
                status_code: 301,
                target_url: { expression: targetUrlExpr },
                preserve_query_string: false,
              },
            },
            enabled: true,
          };

          const epResp = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`,
            { headers }
          );
          const epData = (await epResp.json()) as any;

          if (epData.success && epData.result) {
            const existingRules = (epData.result.rules || []).filter(
              (r: any) =>
                r.description !== 'Redirect from WWW to root' &&
                r.description !== 'Redirect from root to WWW' &&
                r.description !== 'Redirect from WWW to root [Template]' &&
                r.description !== 'Redirect from root to WWW [Template]' &&
                r.description !== 'Force WWW to Root Domain' &&
                r.description !== 'Force Root Domain to WWW'
            );
            existingRules.unshift(targetRule);

            await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/${epData.result.id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ rules: existingRules }),
            });
          } else {
            await fetch(
              `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`,
              {
                method: 'PUT',
                headers,
                body: JSON.stringify({ rules: [targetRule] }),
              }
            );
          }
          logs[logs.length - 1].status = 'success';
          logs[logs.length - 1].message = `Applied official template: "${templateName}" (301 redirect).`;
        } catch (rErr: any) {
          logs[logs.length - 1].status = 'warning';
          logs[logs.length - 1].message = `Redirect template notice: ${rErr.message}`;
        }
      }

      // Step E: Origin CA Certificate generation for cPanel
      let originCertResult: any = undefined;
      if (payload.generateOriginCert !== false) {
        logs.push({
          id: 'origin_cert',
          title: 'Generate 15-Year Origin CA Certificate for cPanel',
          status: 'in_progress',
          timestamp: Date.now(),
        });

        try {
          const certHeaders = getOriginCertHeaders(payload.auth);
          const validityDays = payload.certValidityDays || 5475; // 15 years

          const certResp = await fetch('https://api.cloudflare.com/client/v4/certificates', {
            method: 'POST',
            headers: certHeaders,
            body: JSON.stringify({
              hostnames: [cleanDomain, `*.${cleanDomain}`],
              requested_validity: validityDays,
              request_type: 'origin-rsa',
            }),
          });

          const certData = await certResp.json() as any;

          if (certData.success && certData.result) {
            originCertResult = {
              certificate: certData.result.certificate,
              privateKey: certData.result.private_key,
              expiresOn: certData.result.expires_on,
              hostnames: certData.result.hostnames || [cleanDomain, `*.${cleanDomain}`],
            };
            logs[logs.length - 1].status = 'success';
            logs[logs.length - 1].message = `Successfully generated 15-year Origin Certificate and RSA Private Key for cPanel!`;
          } else {
            const errMsg = certData.errors?.[0]?.message || 'Origin CA API requires User Key or Origin CA Key.';
            logs[logs.length - 1].status = 'warning';
            logs[logs.length - 1].message = `Origin CA notice: ${errMsg}. You can create an Origin Cert in Cloudflare Dash -> SSL/TLS -> Origin Server.`;
          }
        } catch (err: any) {
          logs[logs.length - 1].status = 'warning';
          logs[logs.length - 1].message = `Origin Certificate could not be created automatically: ${err.message}`;
        }
      }

      const finalResult = {
        id: `prov_${Date.now()}`,
        domain: cleanDomain,
        serverIp: payload.serverIp,
        zoneId,
        accountEmail: payload.auth.email || 'Cloudflare Account',
        nameservers,
        dnsRecords: dnsResults,
        originCert: originCertResult,
        sslMode,
        alwaysHttpsEnabled: payload.enableAlwaysHttps !== false,
        createdAt: new Date().toISOString(),
        logs,
      };

      sendJsonResponse(res, 200, {
        success: true,
        result: finalResult,
      });
      return true;
    }

    sendJsonResponse(res, 404, { success: false, error: 'Endpoint not found' });
    return true;
  } catch (globalError: any) {
    console.error('API Error:', globalError);
    sendJsonResponse(res, 500, {
      success: false,
      error: globalError.message || 'Internal server error processing Cloudflare request.',
    });
    return true;
  }
}
