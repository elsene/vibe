import Purchases, { CustomerInfo, LOG_LEVEL, Offerings, PACKAGE_TYPE } from 'react-native-purchases';
import { Platform } from 'react-native';

const RC_PUBLIC_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'appl_MmAYCbZZdUewSZIINjqvxMipwox';

export async function rcInit() {
  if (Platform.OS !== 'ios') return;
  Purchases.setLogLevel(LOG_LEVEL.WARN);
  await Purchases.configure({ apiKey: RC_PUBLIC_IOS_KEY });
}

export async function rcGetOfferings(): Promise<Offerings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings || null;
  } catch (e) {
    console.warn('RC getOfferings error', e);
    return null;
  }
}

export async function rcPurchaseByIdentifier(pkgIdentifier: string) {
  const offerings = await rcGetOfferings();
  const current = offerings?.current;
  if (!current) throw new Error('No current offering');

  const pkg = current.availablePackages.find(p => p.identifier === pkgIdentifier)
    || current.availablePackages.find(p =>
        (p.packageType === PACKAGE_TYPE.MONTHLY && pkgIdentifier === 'monthly') ||
        (p.packageType === PACKAGE_TYPE.ANNUAL && pkgIdentifier === 'annual')
      );

  if (!pkg) throw new Error(`Package not found: ${pkgIdentifier}`);

  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function rcRestore(): Promise<CustomerInfo> {
  const info = await Purchases.restorePurchases();
  return info;
}

export async function rcIsPremium(info?: CustomerInfo): Promise<boolean> {
  try {
    const ci = info ?? await Purchases.getCustomerInfo();
    return !!ci.entitlements.active.premium;
  } catch {
    return false;
  }
}

export function rcOnCustomerInfoChange(cb: (info: CustomerInfo)=>void) {
  return Purchases.addCustomerInfoUpdateListener(cb);
}

// Diagnostic simple
export async function rcDiagLog() {
  try {
    const offerings = await rcGetOfferings();
    console.log('Offerings current?', !!offerings?.current, offerings?.current?.availablePackages?.map(p => ({
      id: p.identifier,
      price: p.product.priceString,
      skuid: p.product.identifier
    })));
    const info = await Purchases.getCustomerInfo();
    console.log('Premium active?', !!info.entitlements.active.premium);
  } catch (e) {
    console.log('RC DIAG ERROR', e);
  }
}
