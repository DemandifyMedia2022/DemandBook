"use client";

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Permission } from '@/lib/permissions';

interface ProtectedProps {
  children: ReactNode;
  fallback?: ReactNode;
  permission?: Permission;
  role?: 'SUPER_ADMIN' | 'ADMIN';
}

export default function ProtectedComponent({
  children,
  fallback = null,
  permission,
  role
}: ProtectedProps) {
  const { user, checkPermission } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (role && user.role !== role) {
    return <>{fallback}</>;
  }

  if (permission && !checkPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
