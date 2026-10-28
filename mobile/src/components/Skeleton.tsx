import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SHIMMER_WIDTH = 160;

type BlockProps = {
  style: ViewStyle;
  progress: Animated.Value;
  baseColor: string;
};

function ShimmerBlock({ style, progress, baseColor }: BlockProps) {
  const { width } = useWindowDimensions();
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHIMMER_WIDTH, width],
  });

  return (
    <View style={[styles.block, { backgroundColor: baseColor }, style]}>
      <Animated.View style={[styles.shine, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.65)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

type Props = {
  backgroundColor: string;
  baseColor: string;
};

// Web page load hone tak beech me dikhne wala shimmer placeholder
export default function Skeleton({ backgroundColor, baseColor }: Props) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [progress]);

  const block = (style: ViewStyle) => <ShimmerBlock style={style} progress={progress} baseColor={baseColor} />;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {block({ height: 160, borderRadius: 12 })}
      {block({ height: 20, width: '70%' })}
      {block({ height: 14, width: '90%' })}
      {block({ height: 14, width: '50%' })}
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.row}>
          {block({ width: 56, height: 56, borderRadius: 8 })}
          <View style={styles.rowText}>
            {block({ height: 14, width: '80%' })}
            {block({ height: 12, width: '55%' })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    padding: 16,
    gap: 12,
  },
  block: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
});
