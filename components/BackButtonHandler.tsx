'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    window.history.pushState({ page: pathname }, '', pathname);
    const handlePopState = () => {
      if (pathname === '/') return;
      router.back();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pathname]);

  return null;
}