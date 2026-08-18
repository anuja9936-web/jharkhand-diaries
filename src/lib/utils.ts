export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function clampRoleLabel(role: string): 'tourist' | 'vendor' | 'admin' {
  if (role === 'vendor' || role === 'admin') {
    return role;
  }

  return 'tourist';
}

