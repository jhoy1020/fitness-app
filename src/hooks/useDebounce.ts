// useDebounce — debounces a value by the specified delay

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the input value.
 * Useful for search inputs, auto-save, etc.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
