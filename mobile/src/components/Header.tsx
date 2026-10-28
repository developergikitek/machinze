import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppConfig, HeaderAction } from '../appConfig';
import { AppLocation } from '../location';
import BrandLogo from './BrandLogo';
import Icon from './Icon';

type Props = {
  config: AppConfig['header'];
  theme: AppConfig['theme'];
  title: string;
  // true → location + logo wala header (config.brandOn), warna title
  brand: boolean;
  location: AppLocation | null;
  locating: boolean;
  badges: Record<string, number>;
  canGoBack: boolean;
  onBack: () => void;
  onAction: (action: HeaderAction) => void;
  onLocationPress: () => void;
};

// Beech wale logo ki jagah (logo + thoda gap) — location label isse pehle truncate hota hai
const LOGO_SLOT = 150;
const BAR_PADDING = 16;

// "Sector 18, Noida" — area pehle, taaki jagah kam ho to city kate, area nahi
function locationLabel(location: AppLocation | null) {
  if (!location) return 'Set location';
  const city = location.city.split(',')[0]?.trim();
  return city ? `${location.area}, ${city}` : location.area;
}

function Actions({ actions, badges, theme, onAction }: Pick<Props, 'badges' | 'theme' | 'onAction'> & { actions: HeaderAction[] }) {
  return (
    <>
      {actions.map((action) => {
        const count = badges[action.key] ?? action.badge ?? 0;
        return (
          <Pressable key={action.key} onPress={() => onAction(action)} hitSlop={8} style={styles.action}>
            <Icon name={action.icon} size={24} color={theme.text} />
            {count > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary, borderColor: theme.background }]}>
                <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </>
  );
}

export default function Header(props: Props) {
  const { config, theme, title, brand, location, locating, badges, canGoBack, onBack, onAction, onLocationPress } = props;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  if (brand) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <View style={styles.bar}>
          <Pressable
            onPress={onLocationPress}
            disabled={locating}
            hitSlop={8}
            style={[styles.location, { maxWidth: (width - LOGO_SLOT) / 2 - BAR_PADDING }]}
          >
            <Icon name="location" size={18} color={theme.text} />
            <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
              {locating ? 'Locating…' : locationLabel(location)}
            </Text>
            {locating ? (
              <ActivityIndicator size="small" color={theme.muted} />
            ) : (
              <Icon name="chevron-down" size={16} color={theme.text} />
            )}
          </Pressable>
          <View style={styles.logo} pointerEvents="none">
            <BrandLogo size={28} />
          </View>
          <View style={styles.right}>
            <Actions actions={config.actions} badges={badges} theme={theme} onAction={onAction} />
          </View>
        </View>
      </View>
    );
  }

  const showBack = config.showBack && canGoBack;
  return (
    <View
      style={[
        styles.container,
        styles.titleContainer,
        { paddingTop: insets.top, backgroundColor: theme.background, borderBottomColor: theme.border },
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.side}>
          {showBack && (
            <Pressable onPress={onBack} hitSlop={12}>
              <Icon name="chevron-back" size={26} color={theme.text} />
            </Pressable>
          )}
        </View>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.side, styles.right]}>
          <Actions actions={config.actions} badges={badges} theme={theme} onAction={onAction} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  titleContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BAR_PADDING,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  logo: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  right: {
    marginLeft: 'auto',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  side: {
    width: 72,
    flexDirection: 'row',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
  },
  action: {
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
