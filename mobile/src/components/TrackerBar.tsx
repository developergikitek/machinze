import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActiveBooking, BookingStep } from '../activeBooking';
import { AppConfig } from '../appConfig';
import Icon from './Icon';

const STEPS: BookingStep[] = ['confirmed', 'dispatched', 'onsite'];

const STATUS: Record<BookingStep, string> = {
  confirmed: 'Booking confirmed',
  dispatched: 'On the way',
  onsite: 'Arrived at site',
};

type Props = {
  booking: ActiveBooking;
  theme: AppConfig['theme'];
  onPress: () => void;
};

// Swiggy jaisa — booking chal rahi ho to har screen pe footer ke upar. App shell ka hissa hai,
// isliye web page badalne pe na reload hota hai na jhapakta hai.
export default function TrackerBar({ booking, theme, onPress }: Props) {
  const [enter] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, friction: 8, tension: 70, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [enter, pulse]);

  const current = STEPS.indexOf(booking.step);
  const subtitle = booking.step === 'onsite' ? 'Operator is at your site' : `Arriving in ${booking.etaMinutes} min`;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.background,
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.bar, { backgroundColor: theme.text }, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${booking.equipment}, ${STATUS[booking.step]}, ${subtitle}. Track booking`}
      >
        <View style={[styles.iconWrap, { backgroundColor: theme.primary }]}>
          <Icon name="construct" size={20} color={theme.text} />
        </View>

        <View style={styles.body}>
          <View style={styles.statusRow}>
            <View style={styles.dotWrap}>
              <Animated.View
                style={[
                  styles.dot,
                  styles.dotPulse,
                  {
                    backgroundColor: theme.primary,
                    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
                    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
                  },
                ]}
              />
              <View style={[styles.dot, { backgroundColor: theme.primary }]} />
            </View>
            <Text style={[styles.status, { color: theme.primary }]}>{STATUS[booking.step]}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {booking.equipment}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.track}>
          <Text style={[styles.trackText, { color: theme.text }]}>Track</Text>
          <Icon name="chevron-forward" size={14} color={theme.text} />
        </View>

        <View style={styles.progress}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: theme.primary, width: i < current ? '100%' : i === current ? '50%' : '0%' },
                ]}
              />
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0b1437',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotWrap: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotPulse: {
    position: 'absolute',
  },
  status: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 2,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 34,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 17,
    backgroundColor: '#fff',
  },
  trackText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progress: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 7,
    flexDirection: 'row',
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
