import { UserProfile } from '../auth';

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'MANAGE_USERS'
  | 'MANAGE_SETTINGS'
  | 'VIEW_INVOICES'
  | 'CREATE_INVOICES'
  | 'DELETE_INVOICES'
  | 'VIEW_BILLS'
  | 'CREATE_BILLS';

const ROLE_PERMISSIONS: Record<'SUPER_ADMIN' | 'ADMIN', Permission[]> = {
  SUPER_ADMIN: [
    'VIEW_DASHBOARD',
    'MANAGE_USERS',
    'MANAGE_SETTINGS',
    'VIEW_INVOICES',
    'CREATE_INVOICES',
    'DELETE_INVOICES',
    'VIEW_BILLS',
    'CREATE_BILLS'
  ],
  ADMIN: [
    'VIEW_DASHBOARD',
    'VIEW_INVOICES',
    'CREATE_INVOICES',
    'VIEW_BILLS',
    'CREATE_BILLS'
  ]
};

export function hasPermission(user: UserProfile | null, permission: Permission): boolean {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
}

export function isSuperAdmin(user: UserProfile | null): boolean {
  return user?.role === 'SUPER_ADMIN';
}
