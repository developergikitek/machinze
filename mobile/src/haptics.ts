import * as Haptics from 'expo-haptics';

export type HapticStyle = 'selection' | 'light' | 'medium' | 'success' | 'warning' | 'error';

// Halki vibration — kahin support na ho to chupchaap kuch nahi (app kabhi crash na ho)
export function haptic(style: HapticStyle) {
  const run = () => {
    switch (style) {
      case 'selection':
        return Haptics.selectionAsync();
      case 'light':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  try {
    run()?.catch(() => {});
  } catch {
    // native module nahi (purana build) — ignore
  }
}
