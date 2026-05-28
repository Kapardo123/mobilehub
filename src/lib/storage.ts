import { useState, useEffect } from "react";

// Clean string - remove double quotes and extra whitespace
export function cleanString(str: string): string {
  if (typeof str !== 'string') return str;
  return str
    .replace(/^["']|["']$/g, '')  // Remove surrounding quotes
    .trim()
    .replace(/\s+/g, ' ');        // Normalize whitespace
}

// Safe localStorage access (client-side only)
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Safe sessionStorage access (client-side only)
export function useSessionStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Safe initializer for localStorage
export function getLocalStorageSafe<T>(key: string, defaultValue: T) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
      return JSON.parse(stored);
    } catch {
      return stored as any;
    }
  } catch {
    return defaultValue;
  }
}

// Safe initializer for sessionStorage
export function getSessionStorageSafe<T>(key: string, defaultValue: T) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
      const parsed = JSON.parse(stored);
      // If parsed result is a string with quotes, clean it
      if (typeof parsed === 'string') {
        return cleanString(parsed) as any;
      }
      return parsed;
    } catch {
      // If JSON.parse fails, clean the raw string
      return cleanString(stored) as any;
    }
  } catch {
    return defaultValue;
  }
}