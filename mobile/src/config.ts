import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Web dev server ka port — web/package.json "dev" script ke saath same (3000 dusre Next projects le lete hain)
const WEB_PORT = Number(process.env.EXPO_PUBLIC_WEB_PORT) || 3100;

// Next.js app ka URL. Production me EXPO_PUBLIC_WEB_URL set karo (e.g. https://app.example.com).
// Dev me Expo ke host IP se khud nikal lete hain, taaki phone/emulator dono pe chale.
function resolveWebUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_WEB_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:${WEB_PORT}`;
  }
  // Android emulator me host machine 10.0.2.2 pe hoti hai
  return Platform.OS === 'android' ? `http://10.0.2.2:${WEB_PORT}` : `http://localhost:${WEB_PORT}`;
}

export const WEB_URL = resolveWebUrl();

export const APP_CONFIG_URL = `${WEB_URL}/api/app-config`;
