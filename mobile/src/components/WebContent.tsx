import { forwardRef, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import type { WebViewErrorEvent } from 'react-native-webview/lib/WebViewTypes';

import { AppConfig } from '../appConfig';
import type { HapticStyle } from '../haptics';
import type { AppLocation } from '../location';
import Skeleton from './Skeleton';

// react-native-webview ka default generic `undefined` hai, jo TS 6 me props ko `never` bana deta hai
type NoExtraProps = Record<never, never>;
export type WebViewRef = WebView<NoExtraProps>;

// Web (Next.js) se aane wale messages — web/src/lib/native.ts ke NativeMessage ke saath same rakhna
export type WebMessage =
  | { type: 'route'; path: string; title: string }
  | { type: 'badge'; key: string; count: number }
  // "Use current location" — permission maango (zarurat ho to)
  | { type: 'locate' }
  // User ne /location page pe search / saved site se chuni
  | { type: 'setLocation'; location: AppLocation }
  // Permission "Don't ask again" ho gayi — app settings kholo
  | { type: 'openSettings' }
  | { type: 'haptic'; style: HapticStyle };

type Props = {
  uri: string;
  theme: AppConfig['theme'];
  onMessage: (message: WebMessage) => void;
  onNavigationStateChange: (nav: WebViewNavigation) => void;
  // Har page load se pehle chalta hai (e.g. window.__APP_LOCATION__ set karna)
  bootScript?: string;
};

const SKELETON_MAX_MS = 10_000;

const WebContent = forwardRef<WebViewRef, Props>(function WebContent(
  { uri, theme, onMessage, onNavigationStateChange, bootScript },
  ref,
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Android: client-side navigation (pushState) pe onLoadStart aata hai par onLoadEnd nahi —
  // isliye skeleton ko aur raaston se bhi hatao, aur aakhri bachaav ke liye timeout
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), SKELETON_MAX_MS);
    return () => clearTimeout(t);
  }, [loading]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as WebMessage;
      // page render ho chuka (NativeBridge ne route bheja)
      if (message.type === 'route') setLoading(false);
      onMessage(message);
    } catch {
      // non-JSON messages ignore
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <WebView<NoExtraProps>
        ref={ref}
        source={{ uri }}
        style={styles.webview}
        onLoadStart={() => {
          setLoading(true);
          setError(null);
        }}
        onLoadEnd={() => setLoading(false)}
        onLoadProgress={(e) => {
          if (e.nativeEvent.progress >= 1) setLoading(false);
        }}
        onError={(e: WebViewErrorEvent) => setError(e.nativeEvent.description)}
        onMessage={handleMessage}
        onNavigationStateChange={onNavigationStateChange}
        injectedJavaScriptBeforeContentLoaded={bootScript}
        pullToRefreshEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
      />
      {loading && !error && <Skeleton backgroundColor={theme.background} baseColor={theme.border} />}
      {error && (
        <View style={[styles.error, { backgroundColor: theme.background }]}>
          <Text style={[styles.errorTitle, { color: theme.text }]}>{"Couldn't load this page"}</Text>
          <Text style={[styles.errorText, { color: theme.muted }]}>{uri}</Text>
          <Text style={[styles.errorText, { color: theme.muted }]}>{error}</Text>
          <Pressable
            style={[styles.retry, { backgroundColor: theme.primary }]}
            onPress={() => {
              setError(null);
              if (ref && 'current' in ref) ref.current?.reload();
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

export default WebContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  error: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  retry: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
