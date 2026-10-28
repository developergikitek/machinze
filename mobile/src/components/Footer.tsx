import { useEffect, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppConfig, NavItem } from '../appConfig';
import { haptic } from '../haptics';
import Icon from './Icon';

type Props = {
  config: AppConfig['footer'];
  theme: AppConfig['theme'];
  activeKey: string | undefined;
  onSelect: (tab: NavItem) => void;
};

const INDICATOR_WIDTH = 36;
const PADDING_TOP = 12;

// Active hote hi icon halka sa uchhalta hai
function TabIcon({ name, color, active }: { name: string; color: string; active: boolean }) {
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!active) return;
    scale.setValue(0.8);
    Animated.spring(scale, { toValue: 1, friction: 3.5, tension: 220, useNativeDriver: true }).start();
  }, [active, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon name={name} size={24} color={color} filled={active} />
    </Animated.View>
  );
}

export default function Footer({ config, theme, activeKey, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const [indicatorTop, setIndicatorTop] = useState<number | null>(null);
  const [x] = useState(() => new Animated.Value(0));

  const count = config.tabs.length;
  const activeIndex = config.tabs.findIndex((t) => t.key === activeKey);
  const tabWidth = count ? width / count : 0;

  // Ek hi indicator — tab badalne pe spring se slide
  useEffect(() => {
    if (!tabWidth || activeIndex < 0) return;
    Animated.spring(x, {
      toValue: activeIndex * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2,
      friction: 9,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, tabWidth, x]);

  const press = (tab: NavItem) => {
    if (tab.key !== activeKey) haptic('selection');
    onSelect(tab);
  };

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {config.tabs.map((tab, i) => {
        const active = tab.key === activeKey;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => press(tab)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
            <TabIcon name={tab.icon} color={active ? theme.primary : theme.muted} active={active} />
            {config.showLabels && (
              <Text style={[styles.label, { color: active ? theme.text : theme.muted }, active && styles.activeLabel]}>
                {tab.label}
              </Text>
            )}
            {/* jagah rakhne ke liye — asli indicator neeche ek hi hai jo slide karta hai */}
            <View
              style={styles.indicatorSlot}
              onLayout={i === 0 ? (e) => setIndicatorTop(e.nativeEvent.layout.y) : undefined}
            />
          </Pressable>
        );
      })}

      {activeIndex >= 0 && indicatorTop !== null && width > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            { backgroundColor: theme.primary, top: PADDING_TOP + indicatorTop, transform: [{ translateX: x }] },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: PADDING_TOP,
    shadowColor: '#111c4e',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '700',
  },
  indicatorSlot: {
    marginTop: 4,
    height: 3,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    width: INDICATOR_WIDTH,
    height: 3,
    borderRadius: 2,
  },
});
