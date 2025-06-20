// app/navigation-provider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setNavigator } from '@/lib/utils/navigator';

export default function NavigationProvider() {
  const router = useRouter();

  useEffect(() => {
    setNavigator(router.push);
  }, [router]);

  return null;
}
