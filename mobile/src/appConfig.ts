import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_CONFIG_URL } from './config';

// Type web/src/app-config.ts ke saath same rakhna.
export type NavItem = {
  key: string;
  label: string;
  icon: string;
  path: string;
};

export type HeaderAction = {
  key: string;
  icon: string;
  path: string;
  // Static badge; web bhi { type: 'badge', key, count } bhej ke set kar sakta hai
  badge?: number;
};

export type AppConfig = {
  version: number;
  startPath: string;
  theme: {
    primary: string;
    background: string;
    text: string;
    muted: string;
    border: string;
  };
  header: {
    visible: boolean;
    title: string;
    useWebTitle: boolean;
    showBack: boolean;
    actions: HeaderAction[];
    hiddenOn: string[];
    // In paths pe title ki jagah location + logo wala header
    brandOn: string[];
  };
  tracker: {
    visible: boolean;
    hiddenOn: string[];
  };
  footer: {
    visible: boolean;
    showLabels: boolean;
    tabs: NavItem[];
    hiddenOn: string[];
  };
};

// App ke andar bundled fallback — network na ho aur cache bhi khaali ho tab ye use hota hai.
export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  startPath: '/login',
  theme: {
    primary: '#f5a91b',
    background: '#ffffff',
    text: '#111c4e',
    muted: '#8a94a6',
    border: '#eceef2',
  },
  header: {
    visible: true,
    title: 'Machinze',
    useWebTitle: true,
    showBack: true,
    actions: [],
    // equipment detail ka apna header hai (back, ❤️, share)
    hiddenOn: ['/', '/login', '/onboarding', '/location', '/client/home', '/client/equipment', '/client/book', '/client/bookings/confirmed'],
    brandOn: [],
  },
  tracker: {
    visible: true,
    // equipment detail pe neeche Book Now bar hai
    hiddenOn: ['/', '/login', '/onboarding', '/location', '/client/equipment', '/client/book', '/client/bookings/confirmed'],
  },
  footer: {
    visible: true,
    showLabels: true,
    tabs: [
      { key: 'home', label: 'Home', icon: 'home-outline', path: '/client/home' },
      { key: 'bookings', label: 'Bookings', icon: 'calendar-outline', path: '/client/bookings' },
      { key: 'liked', label: 'Liked', icon: 'heart-outline', path: '/client/liked' },
      { key: 'profile', label: 'Profile', icon: 'person-outline', path: '/client/profile' },
    ],
    // booking flow pe tabs nahi — dhyan sirf booking pe
    hiddenOn: ['/', '/login', '/onboarding', '/location', '/client/book'],
  },
};

const CACHE_KEY = 'app-config:v1';
const FETCH_TIMEOUT_MS = 5000;

function isNavItem(value: unknown): value is NavItem {
  const item = value as NavItem;
  return !!item && typeof item.key === 'string' && typeof item.path === 'string' && typeof item.icon === 'string';
}

// Server se aaya JSON default ke upar merge karo, taaki koi field missing/galat ho to app na toote.
function normalize(raw: unknown): AppConfig {
  const input = (raw ?? {}) as Partial<AppConfig>;
  const header = { ...DEFAULT_CONFIG.header, ...input.header };
  const footer = { ...DEFAULT_CONFIG.footer, ...input.footer };
  const tracker = { ...DEFAULT_CONFIG.tracker, ...input.tracker };

  const tabs = Array.isArray(footer.tabs) ? footer.tabs.filter(isNavItem) : [];

  return {
    version: typeof input.version === 'number' ? input.version : DEFAULT_CONFIG.version,
    startPath:
      typeof input.startPath === 'string' && input.startPath.startsWith('/') ? input.startPath : DEFAULT_CONFIG.startPath,
    theme: { ...DEFAULT_CONFIG.theme, ...input.theme },
    header: {
      ...header,
      actions: Array.isArray(header.actions) ? header.actions.filter((a) => isNavItem({ ...a, label: '' })) : [],
      hiddenOn: Array.isArray(header.hiddenOn) ? header.hiddenOn : [],
      brandOn: Array.isArray(header.brandOn) ? header.brandOn : [],
    },
    tracker: {
      ...tracker,
      hiddenOn: Array.isArray(tracker.hiddenOn) ? tracker.hiddenOn : [],
    },
    footer: {
      ...footer,
      tabs: tabs.length ? tabs : DEFAULT_CONFIG.footer.tabs,
      hiddenOn: Array.isArray(footer.hiddenOn) ? footer.hiddenOn : [],
    },
  };
}

async function fetchRemoteConfig(): Promise<AppConfig> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(APP_CONFIG_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`app-config ${res.status}`);
    return normalize(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

// Pehle cache (ya default) turant dikhao, phir server se fresh config lao.
// App foreground me wapas aaye tab bhi refresh hota hai.
export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const fresh = await fetchRemoteConfig();
        if (cancelled) return;
        setConfig(fresh);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
      } catch (e) {
        console.warn('[app-config] remote fetch failed, using cached/default', e);
      }
    };

    (async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) setConfig(normalize(JSON.parse(cached)));
      } catch {
        // corrupt cache — default chalega
      }
      if (!cancelled) setReady(true);
      refresh();
    })();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return { config, ready };
}

export function matchesPath(path: string, patterns: string[]): boolean {
  return patterns.some((p) => (p === '/' ? path === '/' : path === p || path.startsWith(`${p}/`)));
}
