export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function clampRoleLabel(role: string): 'tourist' | 'provider' | 'admin' {
  if (role === 'provider' || role === 'admin') {
    return role;
  }

  if (role === 'vendor') {
    return 'provider';
  }

  return 'tourist';
}

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

export function formatIndianCurrency(value: number | string | null | undefined): string {
  if (value == null || value === '') {
    return 'Free / check locally';
  }

  const parsedValue = typeof value === 'string' ? Number(value) : value;

  if (!Number.isFinite(parsedValue)) {
    return 'Free / check locally';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(parsedValue);
}
