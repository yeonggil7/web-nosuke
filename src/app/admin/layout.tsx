'use client';

import AdminProtected from '@/components/AdminProtected';
import AdminNavigation from '@/components/AdminNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtected>
      <AdminNavigation>
            {children}
      </AdminNavigation>
    </AdminProtected>
  );
} 