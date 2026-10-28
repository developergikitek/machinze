import Ionicons from '@expo/vector-icons/Ionicons';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  name: string;
  size: number;
  color: string;
  // "home-outline" ka filled version "home" dikhao
  filled?: boolean;
};

function resolve(name: string, filled?: boolean): IconName {
  const candidate = filled ? name.replace(/-outline$/, '') : name;
  if (candidate in Ionicons.glyphMap) return candidate as IconName;
  if (name in Ionicons.glyphMap) return name as IconName;
  return 'ellipse-outline';
}

// Server config me icon ka naam string aata hai — galat naam pe crash ki jagah fallback icon.
export default function Icon({ name, size, color, filled }: Props) {
  return <Ionicons name={resolve(name, filled)} size={size} color={color} />;
}
