'use client';

import { useEffect, useState } from 'react';

/** True only after client mount — use to avoid hydration mismatch with localStorage, window, etc. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
