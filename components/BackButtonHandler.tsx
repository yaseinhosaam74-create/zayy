'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Push a state so back button works
    window.history.pushState({ page: pathname }, '', pathname);

    const handlePopState = () => {
      // If we're on home, do nothing
      if (pathname === '/') return;
      router.back();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pathname]);

  return null;
}