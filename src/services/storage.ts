import type { CloudflareAuth, DomainRecord, SavedAccount } from '../types/provisioner';

const STORAGE_KEYS = {
  MASTER_AUTH: 'cf_prov_master_auth',
  SAVED_ACCOUNTS: 'cf_prov_saved_accounts',
  DOMAIN_VAULT: 'cf_prov_domain_vault',
  DEFAULT_SETTINGS: 'cf_prov_default_settings',
};

export interface DefaultSettings {
  defaultIp: string;
  proxyDns: boolean;
  enableAlwaysHttps: boolean;
  sslMode: 'full' | 'strict' | 'flexible';
  generateOriginCert: boolean;
}

const DEFAULT_SETTINGS_FALLBACK: DefaultSettings = {
  defaultIp: '',
  proxyDns: true,
  enableAlwaysHttps: true,
  sslMode: 'full',
  generateOriginCert: true,
};

export function getMasterAuth(): CloudflareAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveMasterAuth(auth: CloudflareAuth): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MASTER_AUTH, JSON.stringify(auth));
  } catch (e) {
    console.error('Failed to save master auth', e);
  }
}

export function getSavedAccounts(): SavedAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_ACCOUNTS);
    if (!raw) {
      return [
        {
          id: 'acc_demo_client_1',
          label: 'Client: Apex Studios',
          email: 'admin@apexstudios.com',
          authType: 'global_key',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAccount(account: SavedAccount): void {
  try {
    const current = getSavedAccounts();
    const existingIndex = current.findIndex((a) => a.id === account.id || (a.email && a.email.toLowerCase() === account.email.toLowerCase()));
    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...account };
    } else {
      current.unshift(account);
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save account', e);
  }
}

export function deleteSavedAccount(id: string): void {
  try {
    const current = getSavedAccounts().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete account', e);
  }
}

export function getDomainVault(): DomainRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOMAIN_VAULT);
    if (!raw) {
      // Preload a sample completed record so user sees the interface
      return [
        {
          id: 'dom_sample_1',
          domain: 'clientportfolio.shop',
          serverIp: '198.51.100.42',
          clientEmail: 'contact@clientportfolio.shop',
          accountLabel: 'Client Direct Account',
          nameservers: ['dane.ns.cloudflare.com', 'lola.ns.cloudflare.com'],
          status: 'setup_completed',
          sslMode: 'full',
          hasOriginCert: true,
          originCertExpiry: '2041-10-07T00:00:00.000Z',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          notes: 'cPanel Host server #4. Root A & WWW CNAME created.',
          isDemo: true,
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDomainToVault(domainRecord: DomainRecord): void {
  try {
    const current = getDomainVault();
    const existingIndex = current.findIndex((d) => d.domain.toLowerCase() === domainRecord.domain.toLowerCase());
    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...domainRecord };
    } else {
      current.unshift(domainRecord);
    }
    localStorage.setItem(STORAGE_KEYS.DOMAIN_VAULT, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save domain', e);
  }
}

export function removeDomainFromVault(id: string): void {
  try {
    const current = getDomainVault().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOMAIN_VAULT, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete domain', e);
  }
}

export function getDefaultSettings(): DefaultSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEFAULT_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS_FALLBACK, ...JSON.parse(raw) } : DEFAULT_SETTINGS_FALLBACK;
  } catch {
    return DEFAULT_SETTINGS_FALLBACK;
  }
}

export function saveDefaultSettings(settings: Partial<DefaultSettings>): void {
  try {
    const current = getDefaultSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.DEFAULT_SETTINGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
