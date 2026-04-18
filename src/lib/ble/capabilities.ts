import { Capacitor } from '@capacitor/core';

type WebBluetooth = {
  requestLEScan?: unknown;
  getAvailability?: () => Promise<boolean>;
};

function webBluetooth(): WebBluetooth | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as unknown as { bluetooth?: WebBluetooth };
  return nav.bluetooth ?? null;
}

export function hasWebBluetooth(): boolean {
  return webBluetooth() !== null;
}

export function canPickDevice(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return hasWebBluetooth();
}

/**
 * Native platforms always support the live scan.
 * Web platforms only support it when `navigator.bluetooth.requestLEScan` exists,
 * which in Chrome/Edge requires `chrome://flags/#enable-experimental-web-platform-features`.
 */
export function canUseLiveScan(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  const bt = webBluetooth();
  return typeof bt?.requestLEScan === 'function';
}
