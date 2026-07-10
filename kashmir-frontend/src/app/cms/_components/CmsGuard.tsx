'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCmsToken } from '@/lib/api';

export default function CmsGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Login page itself is always accessible
    if (pathname === '/cms') {
      setChecked(true);
      return;
    }
    if (!getCmsToken()) {
      router.replace('/cms');
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  // Render nothing until auth is verified — prevents flash of protected content
  if (!checked && pathname !== '/cms') return null;

  return <>{children}</>;
}
