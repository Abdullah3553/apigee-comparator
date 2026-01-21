export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString();
}

export function formatDateRelative(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Invalid date';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  return formatDate(d);
}

export function formatIdentifier(identifier: string): string {
  const parts = identifier.split('-');
  if (parts.length >= 3) {
    const [instance, org, ...envParts] = parts;
    const env = envParts.join('-');
    return `${instance} / ${org} / ${env}`;
  }
  return identifier;
}

export function formatEnvironmentShort(identifier: string): string {
  const parts = identifier.split('-');
  if (parts.length >= 3) {
    return parts.slice(2).join('-');
  }
  return identifier;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

export function formatEntityType(type: string): string {
  const typeMap: Record<string, string> = {
    apps: 'Apps',
    products: 'API Products',
    proxies: 'API Proxies',
    caches: 'Caches',
    kvms: 'Key-Value Maps',
    'target-servers': 'Target Servers',
    references: 'References',
    keystores: 'Keystores',
    'virtual-hosts': 'Virtual Hosts',
  };
  return typeMap[type] || type;
}
