/**
 * Emergency information screen
 * Will display emergency contacts, guidance, and local authority details relevant to active warnings.
 */

import { View } from 'react-native';
import {SettingsButton} from "../components/SettingsButton";

interface EmergencyPageProps {
  onSettingsPress?: () => void;
}

export function EmergencyPage({ onSettingsPress }: EmergencyPageProps) {
    // placeholder for future content
  return <View className="flex-1" >
  <SettingsButton onPress={onSettingsPress} /> 
  </View>;
}

