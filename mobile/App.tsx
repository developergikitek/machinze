import { useRef, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Edge, SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebViewNavigation } from 'react-native-webview';

import { useActiveBooking } from './src/activeBooking';
import { haptic } from './src/haptics';
import { matchesPath, NavItem, useAppConfig } from './src/appConfig';
import AppSplash from './src/components/AppSplash';
import Footer from './src/components/Footer';
import Header from './src/components/Header';
import TrackerBar from './src/components/TrackerBar';
import WebContent, { WebMessage, WebViewRef } from './src/components/WebContent';
import { WEB_URL } from './src/config';
import { AppLocation, LocateStatus, locateUser, saveLocation } from './src/location';

// Native splash tab tak dikhe jab tak AppSplash render na ho jaaye (wo khud hide karta hai)
SplashScreen.preventAutoHideAsync().catch(() => {});

// Web side: web/src/lib/appLocation.ts is event / global ko padhta hai
function locationScript(location: AppLocation) {
  const json = JSON.stringify(location);
  return `window.__APP_LOCATION__ = ${json}; window.dispatchEvent(new CustomEvent('app-location', { detail: ${json} })); true;`;
}

// "Use current location" ka nateeja (denied / blocked / off …) — /location page isse message dikhata hai
function locateStatusScript(status: LocateStatus) {
  return `window.dispatchEvent(new CustomEvent('app-location-status', { detail: ${JSON.stringify({ status })} })); true;`;
}

const LOCATION_PATH = '/location';

function pathFromUrl(url: string): string {
  const match = url.match(/^[a-z]+:\/\/[^/]+(\/[^?#]*)?/i);
  return match?.[1] || '/';
}

export default function App() {
  const { config, ready } = useAppConfig();
  const activeBooking = useActiveBooking();
  const webRef = useRef<WebViewRef>(null);
  const [path, setPath] = useState('/');
  const [webTitle, setWebTitle] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [location, setLocation] = useState<AppLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});

  const { theme, header, footer, tracker } = config;
  const initialUri = `${WEB_URL}${config.startPath}`;
  const activeTab = [...footer.tabs]
    .sort((a, b) => b.path.length - a.path.length)
    .find((t) => matchesPath(path, [t.path]));

  const navigate = (item: Pick<NavItem, 'path'>) => {
    const url = `${WEB_URL}${item.path}`;
    webRef.current?.injectJavaScript(`window.location.assign(${JSON.stringify(url)}); true;`);
  };

  const handleWebMessage = (message: WebMessage) => {
    if (message.type === 'route') {
      setPath(message.path);
      setWebTitle(message.title);
    } else if (message.type === 'badge') {
      setBadges((b) => ({ ...b, [message.key]: message.count }));
    } else if (message.type === 'locate') {
      locateCurrent();
    } else if (message.type === 'setLocation') {
      setLocation(message.location);
      saveLocation(message.location);
    } else if (message.type === 'openSettings') {
      Linking.openSettings().catch(() => {});
    } else if (message.type === 'haptic') {
      haptic(message.style);
    }
  };

  const applyLocation = (next: AppLocation) => {
    setLocation(next);
    webRef.current?.injectJavaScript(locationScript(next));
  };

  // Web ke /location page se: permission maango (zarurat ho to) → GPS → web ko nateeja bhejo
  const locateCurrent = async () => {
    setLocating(true);
    const result = await locateUser({ ask: true });
    setLocating(false);
    if (result.status === 'found') applyLocation(result.location);
    webRef.current?.injectJavaScript(locateStatusScript(result.status));
  };

  const handleNavigation = (nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    setPath(pathFromUrl(nav.url));
  };

  const title = (header.useWebTitle && webTitle) || activeTab?.label || header.title;
  const showHeader = header.visible && !matchesPath(path, header.hiddenOn);
  const showFooter = footer.visible && footer.tabs.length > 0 && !matchesPath(path, footer.hiddenOn);
  const showTracker = !!activeBooking && tracker.visible && !matchesPath(path, tracker.hiddenOn);
  // Header/footer chhupe ho to unki jagah safe area padding khud do
  const edges: Edge[] = [...(showHeader ? [] : ['top' as const]), ...(showFooter ? [] : ['bottom' as const])];

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* Cache/default config aane tak WebView mount mat karo, taaki startPath sahi ho.
          Splash ke peeche hi load hona shuru ho jaata hai. */}
      {ready && (
        <SafeAreaView edges={edges} style={[styles.container, { backgroundColor: theme.background }]}>
          {showHeader && (
            <Header
              config={header}
              theme={theme}
              title={title}
              brand={matchesPath(path, header.brandOn)}
              location={location}
              locating={locating}
              badges={badges}
              canGoBack={canGoBack}
              onBack={() => webRef.current?.goBack()}
              onAction={navigate}
              onLocationPress={() => navigate({ path: LOCATION_PATH })}
            />
          )}
          <WebContent
            ref={webRef}
            uri={initialUri}
            theme={theme}
            onMessage={handleWebMessage}
            onNavigationStateChange={handleNavigation}
            bootScript={location ? locationScript(location) : undefined}
          />
          {showTracker && (
            // TODO: /bookings/[id] tracking page
            <TrackerBar booking={activeBooking} theme={theme} onPress={() => navigate({ path: '/client/bookings' })} />
          )}
          {showFooter && <Footer config={footer} theme={theme} activeKey={activeTab?.key} onSelect={navigate} />}
        </SafeAreaView>
      )}
      {!splashDone && (
        <AppSplash
          onDone={(result) => {
            if (result.location) applyLocation(result.location);
            setSplashDone(true);
          }}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
