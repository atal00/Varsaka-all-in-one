'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function TopNavLoader() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // When pathname changes, briefly display the top loading bar then finish
    setNavigating(true);
    const timer = setTimeout(() => {
      setNavigating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!navigating) return null;

  return <div className="top-nav-loader" aria-hidden="true" />;
}

export default TopNavLoader;
