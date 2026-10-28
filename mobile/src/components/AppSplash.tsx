import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Circle, Defs, G, Path, RadialGradient, Rect, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

import { getCachedLocation, hasLocationAccess, LocateResult, locateUser } from '../location';
import { LogoMark } from './BrandLogo';

const NAVY = '#111c4e';
const AMBER = '#f5a91b';
const CREAM = '#FFF8EC'; // app.json ke native splash ka backgroundColor bhi yahi

const MIN_VISIBLE_MS = 1800;
const HOLD_FOUND_MS = 1500;
// Location nahi mili (permission nahi di) — card nahi, seedha aage
const HOLD_EMPTY_MS = 200;

type Props = {
  onDone: (result: LocateResult) => void;
};

function useLoop(duration: number, delay = 0, easing = Easing.inOut(Easing.ease)) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, { toValue: 1, duration, easing, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [value, duration, delay, easing]);
  return value;
}

function MapBackdrop({ width, height }: { width: number; height: number }) {
  // Halki sadkon wala map pattern + neeche skyline aur crane
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <G stroke={NAVY} strokeOpacity={0.06} fill="none" strokeLinecap="round">
        <Path d={`M-20 ${height * 0.22} C ${width * 0.3} ${height * 0.18}, ${width * 0.6} ${height * 0.32}, ${width + 20} ${height * 0.26}`} strokeWidth={14} />
        <Path d={`M${width * 0.18} -20 C ${width * 0.26} ${height * 0.3}, ${width * 0.08} ${height * 0.55}, ${width * 0.22} ${height + 20}`} strokeWidth={10} />
        <Path d={`M-20 ${height * 0.62} C ${width * 0.35} ${height * 0.58}, ${width * 0.7} ${height * 0.7}, ${width + 20} ${height * 0.64}`} strokeWidth={10} />
        <Path d={`M${width * 0.78} -20 C ${width * 0.7} ${height * 0.35}, ${width * 0.92} ${height * 0.6}, ${width * 0.8} ${height + 20}`} strokeWidth={8} />
        <Path d={`M${width * 0.45} ${height * 0.24} L ${width * 0.52} ${height * 0.66}`} strokeWidth={5} />
        <Path d={`M${width * 0.2} ${height * 0.44} L ${width * 0.8} ${height * 0.42}`} strokeWidth={5} />
      </G>
      <G fill={NAVY} fillOpacity={0.035}>
        <Rect x={width * 0.27} y={height * 0.3} width={width * 0.14} height={height * 0.09} rx={8} />
        <Rect x={width * 0.58} y={height * 0.31} width={width * 0.15} height={height * 0.08} rx={8} />
        <Rect x={width * 0.28} y={height * 0.47} width={width * 0.16} height={height * 0.1} rx={8} />
        <Rect x={width * 0.57} y={height * 0.47} width={width * 0.14} height={height * 0.11} rx={8} />
      </G>

      <G fill={NAVY} fillOpacity={0.07}>
        <Rect x={width * 0.04} y={height - 150} width={34} height={150} />
        <Rect x={width * 0.04 + 40} y={height - 110} width={28} height={110} />
        <Rect x={width * 0.32} y={height - 90} width={40} height={90} />
        <Rect x={width * 0.55} y={height - 130} width={30} height={130} />
        <Rect x={width * 0.55 + 36} y={height - 80} width={44} height={80} />
        <Rect x={width * 0.86} y={height - 160} width={36} height={160} />
      </G>
      <G stroke={NAVY} strokeOpacity={0.12} strokeWidth={1.4} fill="none">
        <Path d={`M${width * 0.22} ${height} V ${height - 230} M${width * 0.22 + 8} ${height} V ${height - 230}`} />
        <Path d={`M${width * 0.08} ${height - 226} H ${width * 0.5} M${width * 0.08} ${height - 218} H ${width * 0.5}`} />
        <Path d={`M${width * 0.22 + 4} ${height - 226} V ${height - 246} L ${width * 0.08} ${height - 226} M${width * 0.22 + 4} ${height - 246} L ${width * 0.5} ${height - 226}`} />
        <Path d={`M${width * 0.44} ${height - 218} V ${height - 180}`} />
      </G>
    </Svg>
  );
}

function Blob({
  color,
  size,
  style,
  drift,
  strength = 0.35,
}: {
  color: string;
  size: number;
  style: object;
  drift: Animated.Value;
  strength?: number;
}) {
  const translateX = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 30, 0] });
  const translateY = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -24, 0] });
  return (
    <Animated.View style={[{ position: 'absolute', width: size, height: size }, style, { transform: [{ translateX }, { translateY }] }]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`blob-${size}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={strength} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#blob-${size})`} />
      </Svg>
    </Animated.View>
  );
}

function Pin() {
  return (
    <Svg width={64} height={78} viewBox="0 0 48 58">
      <Defs>
        <SvgGradient id="pin" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffc445" />
          <Stop offset="1" stopColor="#ec960c" />
        </SvgGradient>
      </Defs>
      <Path d="M24 2C13.5 2 5 10.2 5 20.6 5 34 24 54 24 54S43 34 43 20.6C43 10.2 34.5 2 24 2Z" fill="url(#pin)" />
      <Path d="M24 2C13.5 2 5 10.2 5 20.6" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.5} fill="none" />
      <Circle cx={24} cy={20.5} r={9.5} fill="#fff" />
      <Circle cx={24} cy={20.5} r={4.5} fill={NAVY} />
    </Svg>
  );
}

function PulseRing({ progress }: { progress: Animated.Value }) {
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.6] });
  const opacity = progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });
  return <Animated.View style={[styles.ring, { opacity, transform: [{ scaleX: scale }, { scaleY: Animated.multiply(scale, 0.42) }] }]} />;
}

// App khulte hi: logo + location (Swiggy style). Permission yahan nahi maangte —
// pehle se di ho aur GPS on ho to chupchaap le lo, warna onboarding ke baad /location page pe.
// WebView peeche load hota rehta hai.
export default function AppSplash({ onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const [result, setResult] = useState<LocateResult>();
  // true = permission + GPS hai, location dhundh rahe hain (tabhi radar / "Finding…" dikhao)
  const [searching, setSearching] = useState(false);
  // Parent har render pe naya function de sakta hai — ref me rakho taaki hold timer reset na ho
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);
  const [dots, setDots] = useState(1);

  const spin = useLoop(9000, 0, Easing.linear);
  const driftA = useLoop(7000);
  const driftB = useLoop(9000, 600);
  const ringA = useLoop(2100, 0, Easing.out(Easing.quad));
  const ringB = useLoop(2100, 700, Easing.out(Easing.quad));
  const ringC = useLoop(2100, 1400, Easing.out(Easing.quad));

  const [bounce] = useState(() => new Animated.Value(0));
  const [intro] = useState(() => new Animated.Value(0));
  const [card] = useState(() => new Animated.Value(0));
  const [exit] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const hop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 420, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    hop.start();

    const started = Date.now();
    let cancelled = false;
    const locate = async (): Promise<LocateResult> => {
      if (!(await hasLocationAccess())) return { status: 'skipped', location: await getCachedLocation() };
      if (!cancelled) setSearching(true);
      return locateUser({ ask: false });
    };
    locate().then((res) => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - started));
      setTimeout(() => {
        if (cancelled) return;
        hop.stop();
        Animated.spring(bounce, { toValue: 0, friction: 4, useNativeDriver: true }).start();
        setResult(res);
      }, wait);
    });
    return () => {
      cancelled = true;
      hop.stop();
    };
  }, [bounce, intro]);

  useEffect(() => {
    if (result || !searching) return;
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 400);
    return () => clearInterval(t);
  }, [result, searching]);

  useEffect(() => {
    if (!result) return;
    Animated.spring(card, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }).start();
    const t = setTimeout(
      () => {
        Animated.timing(exit, { toValue: 0, duration: 380, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() =>
          onDoneRef.current(result),
        );
      },
      result.location ? HOLD_FOUND_MS : HOLD_EMPTY_MS,
    );
    return () => clearTimeout(t);
  }, [result, card, exit]);

  const pinY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const shadowScale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });
  const introY = intro.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const cardY = card.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const exitScale = exit.interpolate({ inputRange: [0, 1], outputRange: [1.04, 1] });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: exit, transform: [{ scale: exitScale }] }]}
      onLayout={() => SplashScreen.hideAsync().catch(() => {})}
    >
      <LinearGradient colors={[CREAM, '#FFF3DC', '#FFFFFF']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <Blob color={AMBER} size={340} drift={driftA} style={{ top: -120, right: -120 }} />
      <Blob color="#7c93e6" size={300} drift={driftB} strength={0.18} style={{ top: height * 0.35, left: -150 }} />
      <MapBackdrop width={width} height={height} />

      <Animated.View style={[styles.brand, { opacity: intro, transform: [{ translateY: introY }] }]}>
        <LogoMark spin={spin} />
        <View>
          <Text style={styles.wordmark}>
            <Text style={{ color: NAVY }}>Machin</Text>
            <Text style={{ color: '#e8930c' }}>ze</Text>
          </Text>
          <Text style={styles.tagline}>Rent. Build. Succeed.</Text>
        </View>
      </Animated.View>

      <View style={styles.locator}>
        <View style={styles.radar}>
          {searching && !result && (
            <>
              <PulseRing progress={ringA} />
              <PulseRing progress={ringB} />
              <PulseRing progress={ringC} />
            </>
          )}
          <Animated.View style={[styles.pinShadow, { transform: [{ scaleX: shadowScale }] }]} />
          <Animated.View style={[styles.pin, { transform: [{ translateY: pinY }] }]}>
            <Pin />
          </Animated.View>
        </View>

        {searching && !result && <Text style={styles.status}>Finding your location{'.'.repeat(dots)}</Text>}
        {result?.location && (
          // Taazi mili ho ya pichli (cached / user ki chuni hui) — dono me yahi dikhao
          <Animated.View style={[styles.card, { opacity: card, transform: [{ translateY: cardY }] }]}>
            <Text style={styles.caption}>DELIVERING EQUIPMENT TO</Text>
            <Text style={styles.area} numberOfLines={1}>
              {result.location.area}
            </Text>
            {!!result.location.city && (
              <Text style={styles.city} numberOfLines={1}>
                {result.location.city}
              </Text>
            )}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: CREAM,
    zIndex: 100,
  },
  brand: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  tagline: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.4,
  },
  locator: {
    position: 'absolute',
    top: '46%',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  radar: {
    width: 200,
    height: 110,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ring: {
    position: 'absolute',
    bottom: -14,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: AMBER,
    backgroundColor: 'rgba(245,169,27,0.08)',
  },
  pinShadow: {
    position: 'absolute',
    bottom: -6,
    width: 34,
    height: 10,
    borderRadius: 17,
    backgroundColor: 'rgba(17,28,78,0.18)',
  },
  pin: {
    marginBottom: -2,
  },
  status: {
    marginTop: 34,
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  card: {
    marginTop: 26,
    minWidth: 240,
    maxWidth: '100%',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#f1e2c4',
    shadowColor: '#b8860b',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  caption: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#c77d06',
  },
  area: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
  },
  city: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
});
