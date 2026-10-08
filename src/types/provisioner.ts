export interface CloudflareAuth {
  authType: 'token' | 'global_key';
  apiToken?: string;
  email?: string;
  globalApiKey?: string;
  accountId?: string;
  originCaKey?: string;
}

export interface ProvisionOptions {
  domain: string;
  serverIp: string;
  proxyDns: boolean;
  enableAlwaysHttps: boolean;
  sslMode: 'full' | 'strict' | 'flexible';
  generateOriginCert: boolean;
  certValidityDays: number;
  redirectTemplate?: 'www_to_root' | 'root_to_www';
  clientNotes?: string;
}

export interface DnsRecordResult {
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  id?: string;
  status: 'created' | 'updated' | 'already_exists' | 'failed';
}

export interface OriginCertResult {
  certificate: string;
  privateKey?: string;
  expiresOn?: string;
  hostnames: string[];
}

export interface ProvisionStepLog {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'success' | 'warning' | 'error' | 'skipped';
  message?: string;
  timestamp: number;
  details?: Record<string, unknown> | string;
}

export interface ProvisionResult {
  id: string;
  domain: string;
  serverIp: string;
  zoneId?: string;
  accountEmail?: string;
  nameservers: string[];
  dnsRecords: DnsRecordResult[];
  originCert?: OriginCertResult;
  sslMode: string;
  alwaysHttpsEnabled: boolean;
  createdAt: string;
  logs: ProvisionStepLog[];
  isDemo?: boolean;
}

export interface SavedAccount {
  id: string;
  label: string;
  email: string;
  authType: 'token' | 'global_key';
  apiToken?: string;
  globalApiKey?: string;
  accountId?: string;
  isMaster?: boolean;
  createdAt: string;
}

export interface DomainRecord {
  id: string;
  domain: string;
  serverIp: string;
  clientEmail?: string;
  accountLabel?: string;
  nameservers: string[];
  status: 'active' | 'pending_nameservers' | 'setup_completed';
  sslMode: string;
  originCertExpiry?: string;
  hasOriginCert: boolean;
  originCertPem?: string;
  originKeyPem?: string;
  createdAt: string;
  lastChecked?: string;
  notes?: string;
  isDemo?: boolean;
}
