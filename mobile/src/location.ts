import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Web ko bhi yahi shape jaata hai — web/src/lib/appLocation.ts ke saath same rakhna
export type AppLocation = {
  lat: number;
  lng: number;
  // "Sector 62" — chhota, bold dikhane ke liye
  area: string;
  // "Noida, Uttar Pradesh"
  city: string;
};

// skipped = permission/GPS nahi tha aur poochna nahi tha (splash)
// blocked = "Don't ask again" — ab sirf Settings se on hoga
export type LocateStatus = 'found' | 'skipped' | 'denied' | 'blocked' | 'off' | 'failed';

export type LocateResult =
  | { status: 'found'; location: AppLocation }
  | { status: Exclude<LocateStatus, 'found'>; location: AppLocation | null };

const CACHE_KEY = 'app-location:v1';
const FIX_TIMEOUT_MS = 8000;
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function describe(lat: number, lng: number): Promise<AppLocation> {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const area = place?.district || place?.subregion || place?.street || place?.name || place?.city || '';
    const city = [place?.city, place?.region].filter((v) => v && v !== area).join(', ');
    return { lat, lng, area: area || 'Current location', city };
  } catch {
    return { lat, lng, area: 'Current location', city: `${lat.toFixed(3)}, ${lng.toFixed(3)}` };
  }
}

export async function getCachedLocation(): Promise<AppLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AppLocation) : null;
  } catch {
    return null;
  }
}

// User ne khud chuni (search / saved site) — agli baar app khule to yahi dikhe
export async function saveLocation(location: AppLocation) {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(location)).catch(() => {});
}

// Bina kuch pooche: permission pehle se di hai aur GPS on hai?
export async function hasLocationAccess(): Promise<boolean> {
  try {
    const { granted } = await Location.getForegroundPermissionsAsync();
    return granted && (await Location.hasServicesEnabledAsync());
  } catch {
    return false;
  }
}

// ask=false (splash): permission/GPS na ho to kuch mat poocho, cached location ke saath aage badho.
// ask=true ("Use current location" tap): permission maango, GPS off ho to Android ka "turn on" dialog.
export async function locateUser({ ask }: { ask: boolean }): Promise<LocateResult> {
  const cached = await getCachedLocation();
  try {
    let permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      if (!ask) return { status: 'skipped', location: cached };
      if (permission.canAskAgain) permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) return { status: permission.canAskAgain ? 'denied' : 'blocked', location: cached };
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      if (!ask) return { status: 'skipped', location: cached };
      // Android: Google ka "Turn on device location" dialog. Mana kare to throw karta hai.
      if (Platform.OS === 'android') await Location.enableNetworkProviderAsync().catch(() => {});
      if (!(await Location.hasServicesEnabledAsync())) return { status: 'off', location: cached };
    }

    // 1) taaza last known (fast) → 2) nayi fix (timeout) → 3) koi bhi purani last known —
    // GPS kamzor ho / device hila na ho to nayi fix aati hi nahi; purana area khaali se behtar
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: LAST_KNOWN_MAX_AGE_MS })) ??
      (await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        FIX_TIMEOUT_MS,
      ).catch(() => null)) ??
      (await Location.getLastKnownPositionAsync());
    if (!position) return { status: 'failed', location: cached };

    const location = await describe(position.coords.latitude, position.coords.longitude);
    saveLocation(location);
    return { status: 'found', location };
  } catch {
    return { status: 'failed', location: cached };
  }
}
