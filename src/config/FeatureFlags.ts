import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOL = (v?: string, d = false) => (v?.toLowerCase?.() === 'true' ? true : v?.toLowerCase?.() === 'false' ? false : d);

export const FLAGS = {
  ADS_ENABLED:      BOOL(process.env.EXPO_PUBLIC_ADS_ENABLED, true),
  RC_ENABLED:       BOOL(process.env.EXPO_PUBLIC_RC_ENABLED,  true),
  GC_ENABLED:       BOOL(process.env.EXPO_PUBLIC_GC_ENABLED,  true),
  ADMOB_MODE_PROD:  BOOL(process.env.EXPO_PUBLIC_ADMOB_PROD,  false), // false => test ids
};

const SAFE_MODE_KEY = 'app.safe_mode.v1';

export async function getSafeMode() {
  const v = await AsyncStorage.getItem(SAFE_MODE_KEY);
  return v === '1';
}

export async function setSafeMode(on: boolean) {
  await AsyncStorage.setItem(SAFE_MODE_KEY, on ? '1' : '0');
}

export async function effectiveFlags() {
  const safe = await getSafeMode();
  return {
    ...FLAGS,
    ADS_ENABLED: FLAGS.ADS_ENABLED && !safe,
    RC_ENABLED:  FLAGS.RC_ENABLED  && !safe,
    GC_ENABLED:  FLAGS.GC_ENABLED  && !safe,
    SAFE_MODE: safe,
  };
}
