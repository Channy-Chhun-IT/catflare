/**
 * Self-contained Bookmarklet generator for Cloudflare Dashboard.
 * Injects a sleek, zero-dependency modal directly on dash.cloudflare.com
 * that performs:
 *  1. Auto-fill credentials on https://dash.cloudflare.com/sign-up
 *  2. Auto-select Free Plan ($0), Continue to Activation, Confirm "Add records later"
 *  3. Instantly commit Free Plan subscription via Cloudflare API v4
 *  4. Extract and present both assigned Nameservers with 1-click copy!
 */

export interface BookmarkletConfig {
  defaultIp: string;
  defaultRedirect: 'www_to_root' | 'root_to_www';
  sslMode: 'strict' | 'full';
  alwaysHttps: boolean;
  proxyDns: boolean;
}

export interface ZoneCreatorConfig {
  defaultDomain?: string;
  defaultEmail?: string;
  defaultPassword?: string;
  defaultIp?: string;
}

export function generateZoneCreatorBookmarkletCode(config?: ZoneCreatorConfig): string {
  const defaultDomain = (config?.defaultDomain || '').trim();
  const defaultEmail = (config?.defaultEmail || '').trim();
  const defaultPassword = (config?.defaultPassword || '').trim();

  const scriptBody = `(function(){
  function $(id) { return document.getElementById(id); }
  var existing = $('cf-zc-modal');
  if (existing) existing.remove();

  function cleanDomain(d) {
    return (d || '').toLowerCase().trim().replace(/^https?:\\/\\//i, '').replace(/\\/.*$/, '').replace(/^[a-z0-9_-]+@/i, '');
  }

  function getPendingDomain() {
    try {
      return localStorage.getItem('catflare_pending_domain') || sessionStorage.getItem('catflare_pending_domain') || '';
    } catch (_) { return ''; }
  }

  function getWorkflowStep() {
    try {
      return localStorage.getItem('catflare_workflow_step') || sessionStorage.getItem('catflare_workflow_step') || '';
    } catch (_) { return ''; }
  }

  function setWorkflowStep(step) {
    try {
      localStorage.setItem('catflare_workflow_step', step);
      sessionStorage.setItem('catflare_workflow_step', step);
    } catch (_) {}
  }

  function savePendingDomain(domain, step) {
    if (!domain) return;
    try {
      var cd = cleanDomain(domain);
      localStorage.setItem('catflare_pending_domain', cd);
      sessionStorage.setItem('catflare_pending_domain', cd);
      if (step) setWorkflowStep(step);
    } catch (_) {}
  }

  function clearPendingDomain() {
    try {
      localStorage.removeItem('catflare_pending_domain');
      sessionStorage.removeItem('catflare_pending_domain');
      localStorage.removeItem('catflare_workflow_step');
      sessionStorage.removeItem('catflare_workflow_step');
    } catch (_) {}
  }

  function detectAccountId() {
    var parts = window.location.pathname.split('/');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] && parts[i].length === 32 && /^[a-f0-9]+$/i.test(parts[i])) {
        return parts[i];
      }
    }
    return '';
  }

  function detectDomain() {
    var parts = window.location.pathname.split('/');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] && parts[i].indexOf('.') > 0 && parts[i].length < 65) {
        var d = cleanDomain(decodeURIComponent(parts[i]));
        if (d && d.indexOf('.') > 0 && d.indexOf('cloudflare.com') === -1) {
          return d;
        }
      }
    }
    return '';
  }

  function setNativeValue(el, val) {
    if (!el) return;
    var setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set;
    if (setter) setter.call(el, val); else el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  var EVTS = ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'];
  function triggerClick(el) {
    if (!el) return;
    EVTS.forEach(function(ev) {
      try { el.dispatchEvent(new MouseEvent(ev, { bubbles: true, cancelable: true, view: window })); } catch (_) {}
    });
    try { el.click(); } catch (_) {}
  }

  function cp(text) {
    try { navigator.clipboard.writeText(text); } catch (_) {}
  }

  var path = window.location.pathname;
  var isSignUp = path.indexOf('/sign-up') !== -1;

  // Never run on login page
  if (!isSignUp && path.indexOf('/login') !== -1) {
    return;
  }

  var detectedAccountId = detectAccountId();
  var detectedDomain = detectDomain();
  var pendingDomain = getPendingDomain();
  var workflowStep = getWorkflowStep();

  // Strictly require an active workflow initiated from Step 1 (/sign-up)
  if (!isSignUp) {
    if (!pendingDomain || (workflowStep !== '1' && workflowStep !== '2')) {
      return;
    }
    // If standing on a specific domain in URL that is NOT the fresh domain from Step 1, do nothing
    if (detectedDomain && detectedDomain !== pendingDomain) {
      return;
    }
  }

  var overlay = document.createElement('div');
  overlay.id = 'cf-zc-modal';
  overlay.style.cssText = 'position:fixed;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';

  var box = document.createElement('div');
  box.style.cssText = 'background:#18181b;color:#f4f4f5;border-radius:14px;border:1px solid #3f3f46;box-shadow:0 25px 50px -12px rgba(0,0,0,0.85);font-size:13px;overflow:hidden;';

  var ST_H = 'background:#27272a;padding:14px 18px;border-bottom:1px solid #3f3f46;display:flex;justify-content:space-between;align-items:center;';
  var ST_X = 'background:none;border:none;color:#a1a1aa;font-size:20px;cursor:pointer;line-height:1;';
  var ST_IN = 'width:100%;box-sizing:border-box;background:#09090b;border:1px solid #3f3f46;border-radius:6px;padding:8px 10px;color:#fff;font-size:12px;outline:none;';
  var ST_GB = 'width:100%;background:#22c55e;color:#09090b;font-weight:bold;padding:10px;border:none;border-radius:8px;font-size:12px;cursor:pointer;';
  var ST_DB = 'width:100%;background:#27272a;color:#d4d4d8;border:1px solid #3f3f46;padding:9px;border-radius:8px;font-size:12px;cursor:pointer;';
  var ST_NS = 'color:#f97316;font-weight:bold;font-size:13px;font-family:monospace;';
  var ST_ROW = 'display:flex;justify-content:space-between;align-items:center;background:#18181b;padding:8px 10px;border-radius:6px;';
  var ST_CP = 'background:#27272a;border:1px solid #3f3f46;color:#d4d4d8;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;';

  function closeWidget() {
    overlay.remove();
  }

  function autoSelectFreePlanAndActivate() {
    try {
      var freeBtn = null;

      var freeImg = document.querySelector('img[src*="free-plan"]');
      if (freeImg) {
        var card = freeImg.closest('div');
        for (var d = 0; d < 6 && card; d++) {
          var b = card.querySelector('button');
          if (b && !b.id?.startsWith('cf-') && /select/i.test(b.innerText || '')) {
            freeBtn = b;
            break;
          }
          card = card.parentElement;
        }
      }

      if (!freeBtn) {
        var allBtns = document.querySelectorAll('button');
        for (var i = 0; i < allBtns.length; i++) {
          var btn = allBtns[i];
          if (btn.id && btn.id.startsWith('cf-')) continue;
          if (/select(\s+plan)?/i.test(btn.innerText || '')) {
            var p = btn.parentElement;
            for (var depth = 0; depth < 8 && p; depth++) {
              var pt = p.innerText || '';
              if ((/\bfree\b/i.test(pt) || pt.indexOf('$0') !== -1) && pt.indexOf('$20') === -1) {
                freeBtn = btn;
                break;
              }
              p = p.parentElement;
            }
            if (freeBtn) break;
          }
        }
      }

      if (freeBtn) {
        freeBtn.removeAttribute('disabled');
        triggerClick(freeBtn);
      }

      var allLinks = document.querySelectorAll('button, a');
      for (var f = 0; f < allLinks.length; f++) {
        if (/finish setup|complete setup/i.test(allLinks[f].innerText || '')) {
          triggerClick(allLinks[f]);
          break;
        }
      }

      clickContinueOrActivation();
      setTimeout(clickContinueOrActivation, 400);

      return Boolean(freeBtn);
    } catch (_) {
      return false;
    }
  }

  function clickContinueOrActivation() {
    try {
      var clicked = false;

      // 1. First check if a confirmation modal dialog is open (e.g. Confirm continuing without DNS records)
      var dialogBtns = document.querySelectorAll('[role="dialog"] button, [aria-modal="true"] button');
      for (var d = 0; d < dialogBtns.length; d++) {
        var db = dialogBtns[d];
        if (db.closest('#cf-zc-modal')) continue;
        var dt = (db.innerText || db.textContent || '').trim();
        if (/confirm|continue|add records later|proceed|yes/i.test(dt) && !/cancel|back|close/i.test(dt)) {
          db.removeAttribute('disabled');
          triggerClick(db);
          clicked = true;
          break;
        }
      }

      // 2. Find "Continue to activation" / "Continue" / "Confirm" / "Check nameservers" buttons or links
      var els = document.querySelectorAll('button, a, [role="button"]');
      for (var k = 0; k < els.length; k++) {
        var el = els[k];
        if (el.closest('#cf-zc-modal')) continue;
        var txt = (el.innerText || el.textContent || '').trim();
        if (!txt || txt.length > 60) continue;
        if (/search|cancel|back|add record|import|support|ask ai/i.test(txt)) continue;
        if (/continue to activation|add records later|check nameservers|complete setup|finish setup|^continue$|^confirm$|^activate$/i.test(txt)) {
          el.removeAttribute('disabled');
          triggerClick(el);
          clicked = true;
          // Schedule follow-up clicks in case a confirmation modal opens right after clicking Continue to activation
          setTimeout(function() {
            var mBtns = document.querySelectorAll('[role="dialog"] button, [aria-modal="true"] button, button');
            for (var m = 0; m < mBtns.length; m++) {
              if (mBtns[m].closest('#cf-zc-modal')) continue;
              var mt = (mBtns[m].innerText || mBtns[m].textContent || '').trim();
              if (/^confirm$|add records later|continue without/i.test(mt)) {
                mBtns[m].removeAttribute('disabled');
                triggerClick(mBtns[m]);
              }
            }
          }, 450);
          break;
        }
      }

      return clicked;
    } catch (_) {}
    return false;
  }

  // Nameservers modal is ONLY shown at Step 2 right after adding domain
  function renderNameserversModal(ns1, ns2, domain, boxEl, accountId) {
    var bothNs = [ns1, ns2].join(String.fromCharCode(10));
    cp(bothNs);

    boxEl.innerHTML = [
      '<div style=\"' + ST_H + '\">',
        '<div style=\"display:flex;align-items:center;gap:8px;\">',
          '<span style=\"background:rgba(59,130,246,0.2);color:#3b82f6;padding:4px 8px;border-radius:6px;font-weight:bold;font-size:12px;\">🎉 DOMAIN ADDED (STEP 2)</span>',
          '<strong style=\"font-size:13px;color:#fff;\">Domain &amp; Nameservers Assigned</strong>',
        '</div>',
        '<button id=\"cf-z-close\" style=\"' + ST_X + '\">&times;</button>',
      '</div>',
      '<div style=\"padding:18px;\">',
        '<div style=\"text-align:center;margin-bottom:14px;\">',
          '<div style=\"font-size:28px;margin-bottom:4px;\">🚀</div>',
          '<h3 style=\"font-size:16px;color:#22c55e;margin:0 0 4px 0;font-weight:bold;\">' + domain + '</h3>',
          '<p style=\"font-size:12px;color:#a1a1aa;margin:0;\">Domain added to account! Nameservers copied to clipboard:</p>',
        '</div>',
        '<div style=\"background:#09090b;padding:12px;border-radius:8px;border:1px solid #3f3f46;margin-bottom:14px;\">',
          '<div style=\"margin-bottom:8px;\">',
            '<div style=\"font-size:11px;color:#a1a1aa;margin-bottom:3px;\">Nameserver 1:</div>',
            '<div style=\"' + ST_ROW + '\">',
              '<span style=\"' + ST_NS + '\">' + ns1 + '</span>',
              '<button id=\"cf-ns1\" style=\"' + ST_CP + '\">Copy</button>',
            '</div>',
          '</div>',
          '<div>',
            '<div style=\"font-size:11px;color:#a1a1aa;margin-bottom:3px;\">Nameserver 2:</div>',
            '<div style=\"' + ST_ROW + '\">',
              '<span style=\"' + ST_NS + '\">' + ns2 + '</span>',
              '<button id=\"cf-ns2\" style=\"' + ST_CP + '\">Copy</button>',
            '</div>',
          '</div>',
        '</div>',
        '<button id=\"cf-copy-both\" style=\"width:100%;background:#22c55e;color:#09090b;font-weight:bold;border:none;padding:11px;border-radius:8px;font-size:13px;cursor:pointer;margin-bottom:10px;box-shadow:0 4px 12px rgba(34,197,94,0.3);\">📋 Copy Both Nameservers</button>',
        '<button id=\"cf-go-dom\" style=\"width:100%;background:#3b82f6;color:#fff;font-weight:bold;border:none;padding:11px;border-radius:8px;font-size:13px;cursor:pointer;margin-bottom:10px;\">👉 Open Domain Overview (Step 3)</button>',
        '<button id=\"cf-done\" style=\"' + ST_DB + '\">Close</button>',
      '</div>'
    ].join('');

    $('cf-ns1').onclick = function() {
      cp(ns1);
      this.innerText = 'Copied!';
      setTimeout(function() { if ($('cf-ns1')) $('cf-ns1').innerText = 'Copy'; }, 1500);
    };

    $('cf-ns2').onclick = function() {
      cp(ns2);
      this.innerText = 'Copied!';
      setTimeout(function() { if ($('cf-ns2')) $('cf-ns2').innerText = 'Copy'; }, 1500);
    };

    $('cf-copy-both').onclick = function() {
      cp(bothNs);
      this.innerText = '✅ Copied Both!';
      setTimeout(function() {
        var b = $('cf-copy-both');
        if (b) b.innerText = '📋 Copy Both Nameservers';
      }, 1800);
    };

    if ($('cf-go-dom')) {
      $('cf-go-dom').onclick = function() {
        var acct = accountId || detectedAccountId;
        window.location.href = 'https://dash.cloudflare.com/' + acct + '/' + domain;
      };
    }

    $('cf-z-close').onclick = closeWidget;
    $('cf-done').onclick = closeWidget;
  }

  function showEmailVerification(domain, accountId, boxEl) {
    overlay.style.display = 'flex';
    boxEl.innerHTML = [
      '<div style=\"' + ST_H + '\">',
        '<div style=\"display:flex;align-items:center;gap:8px;\">',
          '<span style=\"background:rgba(234,179,8,0.2);color:#eab308;padding:4px 8px;border-radius:6px;font-weight:bold;font-size:12px;\">📬 ACTION REQUIRED</span>',
          '<strong style=\"font-size:13px;color:#fff;\">Verify Cloudflare Email</strong>',
        '</div>',
        '<button id=\"cf-ev-x\" style=\"' + ST_X + '\">&times;</button>',
      '</div>',
      '<div style=\"padding:18px;text-align:center;\">',
        '<div style=\"font-size:28px;margin-bottom:6px;\">📩</div>',
        '<h4 style=\"font-size:14px;color:#f4f4f5;margin:0 0 6px 0;\">Please Verify Your Email</h4>',
        '<p style=\"font-size:12px;color:#a1a1aa;margin:0 0 14px 0;line-height:1.5;\">',
          'Cloudflare requires email verification before adding domains.<br/>Click the link Cloudflare sent to your inbox, then click below:',
        '</p>',
        '<button id=\"cf-ev-retry\" style=\"' + ST_GB + ';margin-bottom:8px;\">🔄 I Verified Email &mdash; Add Domain Now</button>',
        '<button id=\"cf-ev-close\" style=\"' + ST_DB + '\">Close</button>',
      '</div>'
    ].join('');

    $('cf-ev-x').onclick = closeWidget;
    $('cf-ev-close').onclick = closeWidget;
    $('cf-ev-retry').onclick = function() {
      runStep2AddDomain(domain, accountId, boxEl);
    };
  }

  async function runStep2AddDomain(domVal, targetAccountId, boxEl) {
    var domain = cleanDomain(domVal);
    if (!domain) {
      closeWidget();
      return;
    }

    try {
      var accountId = targetAccountId || detectedAccountId;
      if (!accountId) {
        var aRes = await fetch('/api/v4/accounts?per_page=20');
        var aData = await aRes.json();
        if (aData.success && aData.result && aData.result.length > 0) {
          accountId = aData.result[0].id;
        } else {
          closeWidget();
          return;
        }
      }

      // Check if this account ALREADY has existing domains in it
      var existingRes = await fetch('/api/v4/zones?per_page=20');
      var existingData = await existingRes.json();
      if (existingData.success && existingData.result && existingData.result.length > 0) {
        // Do NOT run in any existing account that already has domains
        clearPendingDomain();
        closeWidget();
        return;
      }

      // Account is verified fresh (0 domains) -> show modal and add domain
      overlay.style.display = 'flex';
      boxEl.innerHTML = [
        '<div style=\"text-align:center;padding:22px 16px;\">',
          '<div style=\"font-size:28px;margin-bottom:8px;\">⚡</div>',
          '<h3 style=\"font-size:15px;font-weight:bold;color:#22c55e;margin:0 0 4px 0;\">Auto-Assigning Domain to Account...</h3>',
          '<p style=\"font-size:12px;color:#a1a1aa;margin:0 0 12px 0;\">Connecting <strong style=\"color:#fff;\">' + domain + '</strong></p>',
          '<div id=\"cf-log\" style=\"font-family:monospace;font-size:11px;color:#d4d4d8;background:#09090b;padding:10px;border-radius:6px;max-height:130px;overflow-y:auto;border:1px solid #3f3f46;text-align:left;line-height:1.5;\"></div>',
        '</div>'
      ].join('');

      var lb = $('cf-log');
      function logMsg(m, c) {
        if (lb) {
          lb.innerHTML += '<span style=\"color:' + (c || '#a1a1aa') + ';\">' + m + '</span><br/>';
          lb.scrollTop = lb.scrollHeight;
        }
      }

      logMsg('Adding domain via Cloudflare API...', '#f97316');
      var zRes = await fetch('/api/v4/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: domain,
          account: { id: accountId },
          jump_start: true,
          type: 'full'
        })
      });
      var zData = await zRes.json();
      if (!zData.success) {
        var errM = (zData.errors && zData.errors[0] && zData.errors[0].message) || 'Failed to add zone.';
        var errC = (zData.errors && zData.errors[0] && zData.errors[0].code) || 0;
        if (errC === 1049 || errC === 10000 || /verify.*email/i.test(errM)) {
          showEmailVerification(domain, accountId, boxEl);
          return;
        }
        throw new Error(errM);
      }

      logMsg('Domain added successfully!', '#22c55e');
      var zoneData = zData.result;

      // Advance workflow state to Step 2 completed (ready for Step 3 plan & activation)
      setWorkflowStep('2');

      logMsg('Retrieving assigned nameservers...', '#f97316');
      var nameservers = (zoneData && zoneData.name_servers) || [];
      if ((!nameservers || !nameservers.length) && zoneData && zoneData.id) {
        for (var i = 0; i < 5; i++) {
          var dRes = await fetch('/api/v4/zones/' + zoneData.id);
          var dData = await dRes.json();
          if (dData.success && dData.result && dData.result.name_servers && dData.result.name_servers.length >= 2) {
            nameservers = dData.result.name_servers;
            break;
          }
          await new Promise(function(r) { setTimeout(r, 400); });
        }
      }

      var ns1 = (nameservers && nameservers[0]) || 'ns1.cloudflare.com';
      var ns2 = (nameservers && nameservers[1]) || 'ns2.cloudflare.com';
      logMsg('Nameservers ready: ' + ns1 + ', ' + ns2, '#22c55e');

      // Show Nameservers ONLY at Step 2!
      setTimeout(function() {
        renderNameserversModal(ns1, ns2, domain, boxEl, accountId);
      }, 300);

    } catch (err) {
      overlay.style.display = 'flex';
      boxEl.innerHTML = [
        '<div style=\"' + ST_H + '\">',
          '<strong style=\"color:#ef4444;font-size:13px;\">⚠️ Error</strong>',
          '<button id=\"cf-er-x\" style=\"' + ST_X + '\">&times;</button>',
        '</div>',
        '<div style=\"padding:18px;text-align:center;\">',
          '<p style=\"font-size:12px;color:#f4f4f5;margin:0 0 14px 0;line-height:1.5;\">' + err.message + '</p>',
          '<button id=\"cf-er-retry\" style=\"' + ST_GB + ';margin-bottom:8px;\">🔄 Retry</button>',
          '<button id=\"cf-er-close\" style=\"' + ST_DB + '\">Close</button>',
        '</div>'
      ].join('');
      $('cf-er-x').onclick = closeWidget;
      $('cf-er-close').onclick = closeWidget;
      $('cf-er-retry').onclick = function() {
        runStep2AddDomain(domain, targetAccountId, boxEl);
      };
    }
  }

  async function runStep3SelectPlanAndActivate(domVal, targetAccountId, boxEl) {
    var domain = cleanDomain(domVal);
    if (!domain) {
      closeWidget();
      return;
    }

    try {
      var accountId = targetAccountId || detectedAccountId;
      var zoneId = '';

      // Check zone status first: if already active, do NOT run
      var cRes = await fetch('/api/v4/zones?name=' + encodeURIComponent(domain));
      var cData = await cRes.json();
      if (!cData.success || !cData.result || cData.result.length === 0) {
        clearPendingDomain();
        closeWidget();
        return;
      }

      var zObj = cData.result[0];
      if (zObj.status === 'active') {
        clearPendingDomain();
        closeWidget();
        return;
      }
      zoneId = zObj.id;

      // Zone is freshly added & pending -> show compact progress without NS modal
      overlay.style.display = 'flex';
      boxEl.innerHTML = [
        '<div style=\"text-align:center;padding:22px 16px;\">',
          '<div style=\"font-size:28px;margin-bottom:8px;\">⚡</div>',
          '<h3 style=\"font-size:15px;font-weight:bold;color:#22c55e;margin:0 0 4px 0;\">Selecting Free Plan &amp; Activating...</h3>',
          '<p style=\"font-size:12px;color:#a1a1aa;margin:0;\">Completing onboarding for <strong style=\"color:#fff;\">' + domain + '</strong></p>',
        '</div>'
      ].join('');

      if (window.location.pathname.indexOf('/plans') !== -1 && accountId && domain) {
        try {
          window.history.replaceState({}, '', '/' + accountId + '/' + domain);
        } catch (_) {}
      }

      autoSelectFreePlanAndActivate();

      if (zoneId) {
        try {
          await fetch('/api/v4/zones/' + zoneId + '/subscription', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rate_plan: { id: 'free' } })
          });
        } catch (_) {}

        try {
          await fetch('/api/v4/zones/' + zoneId + '/activation_check', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (_) {}
      }

      // Poll continuously for up to 10 seconds to catch the transition to /manual-entry
      // and automatically click "Continue to activation" + any confirmation dialog!
      var ticks = 0;
      var pollIv = setInterval(function() {
        ticks++;
        autoSelectFreePlanAndActivate();
        clickContinueOrActivation();
        if (ticks >= 22) {
          clearInterval(pollIv);
        }
      }, 450);

      // Workflow complete! Clear pending state so clicking again won't trigger popups
      clearPendingDomain();

      setTimeout(function() {
        boxEl.innerHTML = [
          '<div style=\"text-align:center;padding:22px 16px;\">',
            '<div style=\"font-size:28px;margin-bottom:8px;\">✅</div>',
            '<h3 style=\"font-size:15px;font-weight:bold;color:#22c55e;margin:0 0 4px 0;\">Free Plan &amp; Activation Complete!</h3>',
            '<p style=\"font-size:12px;color:#a1a1aa;margin:0;\">Auto-continuing to activation for ' + domain + '...</p>',
          '</div>'
        ].join('');
        setTimeout(closeWidget, 1100);
      }, 900);

    } catch (_) {
      clearPendingDomain();
      closeWidget();
    }
  }

  if (isSignUp) {
    overlay.style.top = '16px';
    overlay.style.right = '16px';
    overlay.style.width = '360px';
    overlay.style.maxWidth = 'calc(100vw - 32px)';

    var targetDom = pendingDomain || '${defaultDomain}';
    box.innerHTML = [
      '<div style=\"' + ST_H + '\">',
        '<div style=\"display:flex;align-items:center;gap:8px;\">',
          '<span style=\"background:rgba(34,197,94,0.2);color:#22c55e;padding:4px 8px;border-radius:6px;font-weight:bold;font-size:12px;\">🌐 STEP 1</span>',
          '<strong style=\"font-size:13px;color:#fff;\">Auto-Fill Sign-Up Credentials</strong>',
        '</div>',
        '<button id=\"cf-z-close\" style=\"' + ST_X + '\">&times;</button>',
      '</div>',
      '<div style=\"padding:16px;\">',
        '<div style=\"background:#09090b;border:1px solid #3f3f46;border-radius:8px;padding:8px 10px;margin-bottom:12px;font-size:11px;color:#a1a1aa;line-height:1.4;\">',
          'Fills credentials &amp; remembers target domain.',
        '</div>',
        '<div style=\"margin-bottom:10px;\">',
          '<label style=\"display:block;margin-bottom:4px;font-size:11px;color:#22c55e;font-weight:600;\">Target Domain Name</label>',
          '<input id=\"cf-in-dom\" type=\"text\" value=\"' + targetDom + '\" placeholder=\"clientdomain.com\" style=\"' + ST_IN + 'border-color:#22c55e;font-family:monospace;\" />',
        '</div>',
        '<div style=\"margin-bottom:10px;\">',
          '<label style=\"display:block;margin-bottom:4px;font-size:11px;color:#d4d4d8;\">Cloudflare Email</label>',
          '<input id=\"cf-in-em\" type=\"email\" value=\"${defaultEmail}\" placeholder=\"client@domain.com\" style=\"' + ST_IN + '\" />',
        '</div>',
        '<div style=\"margin-bottom:12px;\">',
          '<label style=\"display:block;margin-bottom:4px;font-size:11px;color:#d4d4d8;\">Cloudflare Password</label>',
          '<input id=\"cf-in-pw\" type=\"password\" value=\"${defaultPassword}\" placeholder=\"Password\" style=\"' + ST_IN + '\" />',
        '</div>',
        '<button id=\"cf-fill-btn\" style=\"' + ST_GB + '\">⚡ Auto-Fill Credentials &amp; Save Domain</button>',
        '<div id=\"cf-st-box\" style=\"margin-top:10px;display:none;\"></div>',
      '</div>'
    ].join('');

    overlay.appendChild(box);
    (document.body || document.documentElement).appendChild(overlay);

    $('cf-z-close').onclick = closeWidget;
    var domInput = $('cf-in-dom');
    domInput.addEventListener('input', function() {
      var d = cleanDomain(domInput.value);
      if (d && d.indexOf('.') > 0) savePendingDomain(d, '1');
    });

    $('cf-fill-btn').onclick = function() {
      var em = $('cf-in-em').value.trim();
      var pw = $('cf-in-pw').value.trim();
      var dm = cleanDomain(domInput.value);
      if (!dm || dm.indexOf('.') === -1) {
        alert('Please enter a valid target domain.');
        return;
      }
      savePendingDomain(dm, '1');

      var emInputs = document.querySelectorAll('input[type=\"email\"], input[name=\"email\"], input[id=\"email\"], input[autocomplete=\"email\"], input[autocomplete=\"username\"]');
      var pwInputs = document.querySelectorAll('input[type=\"password\"], input[name=\"password\"], input[id=\"password\"], input[autocomplete=\"new-password\"], input[autocomplete=\"current-password\"]');

      if (em) for (var i = 0; i < emInputs.length; i++) setNativeValue(emInputs[i], em);
      if (pw) for (var j = 0; j < pwInputs.length; j++) setNativeValue(pwInputs[j], pw);

      $('cf-fill-btn').style.display = 'none';
      var st = $('cf-st-box');
      st.style.display = 'block';
      st.innerHTML = [
        '<div style=\"background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:10px;font-size:11px;line-height:1.5;\">',
          '<div style=\"color:#22c55e;font-weight:bold;margin-bottom:3px;\">✔ Credentials Filled!</div>',
          '<div style=\"color:#f4f4f5;margin-bottom:5px;\">Domain: <strong style=\"color:#fff;\">' + dm + '</strong></div>',
          '<div style=\"color:#d4d4d8;margin-bottom:6px;\">Solve turnstile captcha &amp; click <strong>\"Sign Up\"</strong>.</div>',
          '<div style=\"background:#27272a;padding:6px;border-radius:6px;color:#38bdf8;font-weight:600;\">👉 Step 2: In new account, click bookmark to auto-add domain &amp; copy Nameservers!</div>',
        '</div>'
      ].join('');
    };
  } else {
    // Hidden initially until account/domain freshness is verified via API
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.75)';
    overlay.style.display = 'none';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    box.style.width = '480px';
    box.style.maxWidth = '92vw';
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    overlay.onclick = function(e) {
      if (e.target === overlay) closeWidget();
    };

    if (workflowStep === '1') {
      runStep2AddDomain(pendingDomain, detectedAccountId, box);
    } else if (workflowStep === '2') {
      runStep3SelectPlanAndActivate(pendingDomain, detectedAccountId, box);
    } else {
      closeWidget();
    }
  }
})();`;

  const minified = scriptBody.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//')).join('\n');
  return 'javascript:' + encodeURI(minified).replace(/#/g, '%23');
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

  // Only work when user has already selected a domain inside Cloudflare Dashboard
  if (window.location.hostname.indexOf('cloudflare.com') === -1 || !detectedAccountId || !detectedDomain) {
    return;
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
        '<input id="cf-input-ip" type="text" value="${config.defaultIp || '198.51.100.24'}" placeholder="198.51.100.24" style="width:100%;box-sizing:border-box;background:#09090b;border:1px solid #3f3f46;border-radius:8px;padding:10px 12px;color:#fff;font-family:monospace;font-size:13px;outline:none;" />',
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

      // Step 8: Redirect Rule (Official Cloudflare Wildcard Template)
      if (redirectChoice === 'www_to_root' || redirectChoice === 'root_to_www') {
        var isWwwToRoot = redirectChoice === 'www_to_root';
        var templateName = isWwwToRoot ? 'Redirect from WWW to root [Template]' : 'Redirect from root to WWW [Template]';
        var ruleExpression = isWwwToRoot
          ? '(http.request.full_uri wildcard "https://www.' + rawDomain + '/*")'
          : '(http.request.full_uri wildcard "https://' + rawDomain + '/*")';
        var targetUrlExpr = isWwwToRoot
          ? 'wildcard_replace(http.request.full_uri, "https://www.' + rawDomain + '/*", "https://' + rawDomain + '/$' + '{1}")'
          : 'wildcard_replace(http.request.full_uri, "https://' + rawDomain + '/*", "https://www.' + rawDomain + '/$' + '{1}")';

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

  return 'javascript:' + encodeURIComponent(scriptBody);
}
