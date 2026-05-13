import 'nativewind';
/// <reference types="nativewind/types" />

// Added Typescript type declarations that extend React Native components
// to support the className prop. Otherwise they are not recognized.

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface FlatListProps<ItemT> {
    className?: string;
  }
  interface SectionListProps<ItemT, SectionT> {
    className?: string;
  }
}

declare module 'react-native-safe-area-context' {
  interface SafeAreaViewProps {
    className?: string;
  }
}
