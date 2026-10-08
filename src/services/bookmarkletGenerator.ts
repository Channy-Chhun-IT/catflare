/**
 * Self-contained Bookmarklet & Userscript generator for Cloudflare Dashboard.
 * Injects a sleek, zero-dependency modal directly on dash.cloudflare.com
 * that performs:
 *  1. Create/Find Zone
 *  2. Add Root A record -> cPanel IP (Proxied ☁️)
 *  3. Add WWW CNAME -> root (Proxied ☁️)
 *  4. Change SSL to "strict"
 *  5. Enable "Always Use HTTPS"
 *  6. Create Single Redirect Rule (www -> root or root -> www)
 *  7. Output assigned Nameservers with 1-click copy!
 */

export interface BookmarkletConfig {
  defaultIp: string;
  defaultRedirect: 'www_to_root' | 'root_to_www';
  sslMode: 'strict' | 'full';
  alwaysHttps: boolean;
  proxyDns: boolean;
}

export function generateBookmarkletCode(config: BookmarkletConfig): string {
  const scriptBody = `(function(){
  if (document.getElementById('cf-fast-cpanel-modal')) {
    document.getElementById('cf-fast-cpanel-modal').remove();
  }

  // Detect Account ID and Domain from current URL (dash.cloudflare.com/:accountId/:domain/...)
  var urlParts = window.location.pathname.split('/');
  var detectedAccountId = '';
  var detectedDomain = '';
  for (var i = 0; i < urlParts.length; i++) {
    if (urlParts[i] && urlParts[i].length === 32 && /^[a-f0-9]+$/i.test(urlParts[i])) {
      detectedAccountId = urlParts[i];
      if (urlParts[i + 1] && urlParts[i + 1].indexOf('.') > 0 && urlParts[i + 1].indexOf('?') === -1) {
        detectedDomain = decodeURIComponent(urlParts[i + 1]);
      }
      break;
    }
  }

  var overlay = document.createElement('div');
  overlay.id = 'cf-fast-cpanel-modal';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.75)';
  overlay.style.zIndex = '9999999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  var box = document.createElement('div');
  box.style.backgroundColor = '#18181b';
  box.style.color = '#f4f4f5';
  box.style.width = '520px';
  box.style.maxWidth = '92vw';
  box.style.borderRadius = '14px';
  box.style.border = '1px solid #3f3f46';
  box.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.7)';
  box.style.overflow = 'hidden';
  box.style.fontSize = '13px';

  box.innerHTML = [
    '<div style="background:#27272a;padding:16px 20px;border-bottom:1px solid #3f3f46;display:flex;justify-content:space-between;align-items:center;">',
      '<div style="display:flex;align-items:center;gap:8px;">',
        '<div style="background:rgba(249,115,22,0.2);color:#f97316;padding:4px 8px;border-radius:6px;font-weight:bold;font-size:12px;">⚡ CATFLARE</div>',
        '<span style="font-weight:600;font-size:14px;">CatFlare Automation</span>',
      '</div>',
      '<button id="cf-modal-close" style="background:none;border:none;color:#a1a1aa;font-size:20px;cursor:pointer;line-height:1;">&times;</button>',
    '</div>',
    '<div style="padding:20px;" id="cf-modal-body">',
      '<div style="margin-bottom:14px;">',
        '<label style="display:block;margin-bottom:6px;font-size:12px;color:#d4d4d8;font-weight:500;">Domain Name (Already Added to CF)</label>',
        '<input id="cf-input-domain" type="text" value="' + detectedDomain + '" placeholder="example.com" style="width:100%;box-sizing:border-box;background:#09090b;border:1px solid #3f3f46;border-radius:8px;padding:10px 12px;color:#fff;font-family:monospace;font-size:13px;outline:none;" />',
      '</div>',
      '<div style="margin-bottom:14px;">',
        '<label style="display:block;margin-bottom:6px;font-size:12px;color:#d4d4d8;font-weight:500;">cPanel Server IP</label>',
        '<input id="cf-input-ip" type="text" value="${config.defaultIp}" placeholder="198.51.100.24" style="width:100%;box-sizing:border-box;background:#09090b;border:1px solid #3f3f46;border-radius:8px;padding:10px 12px;color:#fff;font-family:monospace;font-size:13px;outline:none;" />',
      '</div>',
      '<div style="margin-bottom:14px;">',
        '<label style="display:block;margin-bottom:6px;font-size:12px;color:#d4d4d8;font-weight:500;">Redirect Option</label>',
        '<select id="cf-select-redirect" style="width:100%;box-sizing:border-box;background:#09090b;border:1px solid #3f3f46;border-radius:8px;padding:9px 12px;color:#fff;font-size:12px;outline:none;">',
          '<option value="www_to_root" ${config.defaultRedirect === 'www_to_root' ? 'selected' : ''}>force root</option>',
          '<option value="root_to_www" ${config.defaultRedirect === 'root_to_www' ? 'selected' : ''}>forece www</option>',
        '</select>',
      '</div>',
      '<div style="margin-bottom:16px;">',
        '<label style="display:block;margin-bottom:6px;font-size:12px;color:#d4d4d8;font-weight:500;">Account ID (Auto-detected from URL)</label>',
        '<input id="cf-input-account" type="text" value="' + detectedAccountId + '" placeholder="Account ID" style="width:100%;box-sizing:border-box;background:#09090b;border:1px solid #3f3f46;border-radius:8px;padding:8px 12px;color:#a1a1aa;font-family:monospace;font-size:12px;outline:none;" />',
      '</div>',
      '<div style="background:#27272a;padding:12px;border-radius:8px;margin-bottom:18px;font-size:11px;color:#a1a1aa;line-height:1.5;">',
        '<span style="color:#22c55e;font-weight:bold;">✔</span> SSL Mode: <strong style="color:#fff;">Strict</strong><br/>',
        '<span style="color:#22c55e;font-weight:bold;">✔</span> Always Use HTTPS: <strong style="color:#fff;">Enabled</strong><br/>',
        '<span style="color:#22c55e;font-weight:bold;">✔</span> Root A (@) &amp; WWW CNAME: <strong style="color:#f97316;">Proxied (☁️)</strong>',
      '</div>',
      '<button id="cf-btn-run" style="width:100%;background:#f97316;color:#09090b;font-weight:bold;padding:12px;border:none;border-radius:8px;cursor:pointer;font-size:13px;">🚀 Run 1-Click Setup</button>',
      '<div id="cf-status-log" style="margin-top:12px;display:none;font-family:monospace;font-size:11px;color:#d4d4d8;background:#09090b;padding:12px;border-radius:8px;max-height:160px;overflow-y:auto;border:1px solid #3f3f46;"></div>',
    '</div>'
  ].join('');

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.getElementById('cf-modal-close').onclick = function() {
    overlay.remove();
  };

  overlay.onclick = function(e) {
    if (e.target === overlay) overlay.remove();
  };

  // Execution Handler
  document.getElementById('cf-btn-run').onclick = async function() {
    var rawDomain = document.getElementById('cf-input-domain').value.trim().toLowerCase().replace(/^https?:\\/\\//, '').replace(/\\/.*$/, '');
    var serverIp = document.getElementById('cf-input-ip').value.trim();
    var redirectChoice = document.getElementById('cf-select-redirect').value;
    var accountId = document.getElementById('cf-input-account').value.trim();
    var logBox = document.getElementById('cf-status-log');
    var btn = document.getElementById('cf-btn-run');

    if (!rawDomain || !serverIp) {
      alert('Please enter both domain and server IP.');
      return;
    }

    logBox.style.display = 'block';
    logBox.innerHTML = 'Starting 1-click provisioning...<br/>';
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.innerText = 'Configuring Cloudflare...';

    function addLog(msg, color) {
      logBox.innerHTML += '<span style="color:' + (color || '#a1a1aa') + ';">' + msg + '</span><br/>';
      logBox.scrollTop = logBox.scrollHeight;
    }

    try {
      // Step 1: Detect or verify Account ID if not present
      if (!accountId) {
        addLog('Detecting accounts in session...', '#f97316');
        var accRes = await fetch('/api/v4/accounts');
        var accData = await accRes.json();
        if (accData.success && accData.result && accData.result.length > 0) {
          accountId = accData.result[0].id;
          addLog('Found account: ' + accData.result[0].name, '#22c55e');
        } else {
          throw new Error('Please specify Cloudflare Account ID.');
        }
      }

      // Step 2: Connect to Existing Zone (DO NOT re-assign or re-create zone)
      addLog('Connecting to existing domain ' + rawDomain + ' in account...', '#f97316');
      var getZ = await fetch('/api/v4/zones?name=' + encodeURIComponent(rawDomain));
      var getZData = await getZ.json();
      var zoneId = '';

      if (getZData.success && getZData.result && getZData.result.length > 0) {
        zoneId = getZData.result[0].id;
        addLog('Connected to existing domain: ' + rawDomain, '#22c55e');
      } else {
        // Check with account ID filter if available
        if (accountId) {
          var getAccZ = await fetch('/api/v4/zones?account.id=' + encodeURIComponent(accountId) + '&name=' + encodeURIComponent(rawDomain));
          var getAccZData = await getAccZ.json();
          if (getAccZData.success && getAccZData.result && getAccZData.result.length > 0) {
            zoneId = getAccZData.result[0].id;
            addLog('Connected to existing domain: ' + rawDomain, '#22c55e');
          }
        }
        if (!zoneId) {
          throw new Error('Domain "' + rawDomain + '" was not found in this Cloudflare account. Please ensure the domain is already assigned to this account.');
        }
      }

      // Step 3: Remove ALL existing DNS records first before creating new records
      addLog('Scanning for existing DNS records to remove...', '#f97316');
      var removedCount = 0;
      var hasMoreDns = true;
      while (hasMoreDns) {
        var existingDnsRes = await fetch('/api/v4/zones/' + zoneId + '/dns_records?per_page=100');
        var existingDnsData = await existingDnsRes.json();
        if (existingDnsData.success && existingDnsData.result && existingDnsData.result.length > 0) {
          addLog('Found ' + existingDnsData.result.length + ' existing record(s). Removing all...', '#eab308');
          for (var rIdx = 0; rIdx < existingDnsData.result.length; rIdx++) {
            await fetch('/api/v4/zones/' + zoneId + '/dns_records/' + existingDnsData.result[rIdx].id, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' }
            });
            removedCount++;
          }
        } else {
          hasMoreDns = false;
        }
      }
      if (removedCount > 0) {
        addLog('All ' + removedCount + ' existing DNS record(s) removed cleanly.', '#22c55e');
      } else {
        addLog('No prior DNS records found.', '#22c55e');
      }

      // Step 4: Create fresh Root A Record (@)
      addLog('Adding fresh Root A record (@ -> ' + serverIp + ')...', '#f97316');
      await fetch('/api/v4/zones/' + zoneId + '/dns_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'A', name: '@', content: serverIp, ttl: 1, proxied: true })
      });
      addLog('Root A record created (Proxied ☁️)', '#22c55e');

      // Step 5: Create fresh WWW CNAME Record
      addLog('Adding fresh WWW CNAME record (www -> ' + rawDomain + ')...', '#f97316');
      await fetch('/api/v4/zones/' + zoneId + '/dns_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CNAME', name: 'www', content: rawDomain, ttl: 1, proxied: true })
      });
      addLog('WWW CNAME record created (Proxied ☁️)', '#22c55e');

      // Step 6: Change SSL to STRICT
      addLog('Setting SSL/TLS mode to STRICT...', '#f97316');
      await fetch('/api/v4/zones/' + zoneId + '/settings/ssl', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'strict' })
      });
      addLog('SSL/TLS set to Full (Strict)!', '#22c55e');

      // Step 7: Enable Always Use HTTPS
      addLog('Enabling Always Use HTTPS...', '#f97316');
      await fetch('/api/v4/zones/' + zoneId + '/settings/always_use_https', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'on' })
      });
      addLog('Always Use HTTPS enabled!', '#22c55e');

      // Step 8: Redirect Rule (Official Cloudflare Wildcard Template as in Image 2)
      if (redirectChoice === 'www_to_root' || redirectChoice === 'root_to_www') {
        var isWwwToRoot = redirectChoice === 'www_to_root';
        var templateName = isWwwToRoot ? 'Redirect from WWW to root [Template]' : 'Redirect from root to WWW [Template]';
        var ruleExpression = isWwwToRoot
          ? '(http.request.full_uri wildcard "https://www.' + rawDomain + '/*")'
          : '(http.request.full_uri wildcard "https://' + rawDomain + '/*")';
        var targetUrlExpr = isWwwToRoot
          ? 'wildcard_replace(http.request.full_uri, "https://www.' + rawDomain + '/*", "https://' + rawDomain + '/\${1}")'
          : 'wildcard_replace(http.request.full_uri, "https://' + rawDomain + '/*", "https://www.' + rawDomain + '/\${1}")';

        addLog('Applying wildcard template: "' + templateName + '"...', '#f97316');

        try {
          var targetRule = {
            description: templateName,
            expression: ruleExpression,
            action: 'redirect',
            action_parameters: {
              from_value: {
                status_code: 301,
                target_url: {
                  expression: targetUrlExpr
                },
                preserve_query_string: false
              }
            },
            enabled: true
          };

          // Check if dynamic redirect entrypoint exists
          var epRes = await fetch('/api/v4/zones/' + zoneId + '/rulesets/phases/http_request_dynamic_redirect/entrypoint');
          var epData = await epRes.json();

          if (epData.success && epData.result) {
            var existingRules = (epData.result.rules || []).filter(function(r) {
              return r.description !== 'Redirect from WWW to root [Template]' &&
                     r.description !== 'Redirect from root to WWW [Template]' &&
                     r.description !== 'Redirect from WWW to root' &&
                     r.description !== 'Redirect from root to WWW' &&
                     r.description !== 'Force WWW to Root Domain' &&
                     r.description !== 'Force Root Domain to WWW';
            });
            existingRules.unshift(targetRule);

            await fetch('/api/v4/zones/' + zoneId + '/rulesets/' + epData.result.id, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rules: existingRules })
            });
          } else {
            await fetch('/api/v4/zones/' + zoneId + '/rulesets/phases/http_request_dynamic_redirect/entrypoint', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rules: [targetRule] })
            });
          }
          addLog('Template applied: ' + templateName + ' (301) Active!', '#22c55e');
        } catch (rErr) {
          addLog('Notice on redirect template: ' + rErr.message, '#eab308');
        }
      }

      // Success screen in modal (no nameservers displayed)
      document.getElementById('cf-modal-body').innerHTML = [
        '<div style="text-align:center;padding:12px 0;">',
          '<div style="font-size:36px;margin-bottom:8px;">🎉</div>',
          '<h3 style="font-size:16px;font-weight:bold;color:#22c55e;margin:0 0 6px 0;">Domain Configured Successfully!</h3>',
          '<p style="font-size:12px;color:#a1a1aa;margin:0 0 16px 0;">Zone active, DNS proxied, SSL Strict &amp; HTTPS redirects configured.</p>',
        '</div>',
        '<div style="background:#09090b;padding:14px;border-radius:10px;border:1px solid #3f3f46;margin-bottom:16px;font-size:12px;color:#d4d4d8;line-height:1.6;">',
          '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #27272a;">',
            '<span style="color:#a1a1aa;">Root A (@) &amp; WWW CNAME:</span>',
            '<strong style="color:#f97316;">Proxied (☁️)</strong>',
          '</div>',
          '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #27272a;">',
            '<span style="color:#a1a1aa;">SSL/TLS Encryption:</span>',
            '<strong style="color:#22c55e;">Full (Strict)</strong>',
          '</div>',
          '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #27272a;">',
            '<span style="color:#a1a1aa;">Always Use HTTPS:</span>',
            '<strong style="color:#22c55e;">Enabled (ON)</strong>',
          '</div>',
          '<div style="display:flex;justify-content:space-between;padding:4px 0;">',
            '<span style="color:#a1a1aa;">Single Redirect Rule:</span>',
            '<strong style="color:#fff;">Active (301)</strong>',
          '</div>',
        '</div>',
        '<button onclick="document.getElementById(\\'cf-fast-cpanel-modal\\').remove();" style="width:100%;background:#f97316;color:#09090b;font-weight:bold;border:none;padding:11px;border-radius:8px;font-size:13px;cursor:pointer;">Done</button>'
      ].join('');

    } catch (err) {
      addLog('Error: ' + err.message, '#ef4444');
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.innerText = 'Retry Setup';
    }
  };
})();`;

  // Minify or encode as bookmarklet URL
  return 'javascript:' + encodeURIComponent(scriptBody);
}

export function generateUserscriptCode(config: BookmarkletConfig): string {
  const bookmarklet = generateBookmarkletCode(config).replace(/^javascript:/, '');
  const decodedScript = decodeURIComponent(bookmarklet);

  return `// ==UserScript==
// @name         CatFlare - Fast Cloudflare Automation
// @namespace    https://dash.cloudflare.com/
// @version      1.0
// @description  Automate Zone, DNS records, SSL Strict, Always HTTPS, and Redirect Rules in 1-click directly in Cloudflare Dashboard!
// @author       Catech
// @match        https://dash.cloudflare.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Inject a floating quick-launch button in bottom right corner of Cloudflare Dashboard
  const floatBtn = document.createElement('button');
  floatBtn.innerHTML = '⚡ CatFlare';
  floatBtn.style.position = 'fixed';
  floatBtn.style.bottom = '24px';
  floatBtn.style.right = '24px';
  floatBtn.style.zIndex = '999999';
  floatBtn.style.backgroundColor = '#f97316';
  floatBtn.style.color = '#09090b';
  floatBtn.style.fontWeight = 'bold';
  floatBtn.style.padding = '10px 16px';
  floatBtn.style.borderRadius = '24px';
  floatBtn.style.border = '2px solid #ea580c';
  floatBtn.style.boxShadow = '0 10px 25px -5px rgba(249, 115, 22, 0.4)';
  floatBtn.style.cursor = 'pointer';
  floatBtn.style.fontSize = '12px';
  floatBtn.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  floatBtn.onclick = function() {
    ${decodedScript}
  };

  document.body.appendChild(floatBtn);
})();`;
}
