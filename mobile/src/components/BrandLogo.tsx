import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Rect, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

const NAVY = '#111c4e';
const TEETH = Array.from({ length: 10 }, (_, i) => i * 36);

// Gear + excavator arm — web/src/components/auth/Logo.tsx jaisa. `spin` do to gear ghoomta hai.
export function LogoMark({ size = 56, spin }: { size?: number; spin?: Animated.Value }) {
  const rotate = spin?.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, rotate && { transform: [{ rotate }] }]}>
        <Svg width={size} height={size} viewBox="0 0 48 48">
          <G fill={NAVY}>
            {TEETH.map((deg) => (
              <Rect key={deg} x={21} y={2} width={6} height={8} rx={1.5} transform={`rotate(${deg} 24 24)`} />
            ))}
            <Circle cx={24} cy={24} r={16} />
          </G>
          <Circle cx={24} cy={24} r={11} fill="#fff" />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 48 48" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="amber" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#ffc247" />
            <Stop offset="1" stopColor="#e8930c" />
          </SvgGradient>
        </Defs>
        <Path d="M14 33h14l2-5h-7l-1-4 9-9 6 4 5 7-3 3-3-4-4-2-5 5 1 3h4l2 2v3H14z" fill="url(#amber)" />
        <Path d="M40 30.5l3.5 5.5h-6z" fill="#e8930c" />
        <Rect x={13} y={33.5} width={18} height={4} rx={2} fill={NAVY} />
      </Svg>
    </View>
  );
}

// Header ke beech wala chhota logo
export default function BrandLogo({ size = 30 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <LogoMark size={size} />
      <Text style={[styles.wordmark, { fontSize: size * 0.72 }]}>
        <Text style={{ color: NAVY }}>Machin</Text>
        <Text style={{ color: '#e8930c' }}>ze</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.6,
  },
});
