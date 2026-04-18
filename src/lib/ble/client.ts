import type { DisplayStrings } from '@/schemas/ble';
import { BleClient } from '@capacitor-community/bluetooth-le';

let initPromise: Promise<void> | null = null;

export function initializeBle(
  options: {
    androidNeverForLocation?: boolean;
    displayStrings?: DisplayStrings;
  } = {},
): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await BleClient.initialize({
      androidNeverForLocation: options.androidNeverForLocation ?? true,
    });
    if (options.displayStrings) {
      await BleClient.setDisplayStrings(options.displayStrings);
    }
  })().catch((err) => {
    initPromise = null;
    throw err;
  });
  return initPromise;
}

export function resetBleInitialization(): void {
  initPromise = null;
}

/**
 * Nuclear reset: stop scan, reset init promise, and re-initialize.
 * Call when switching scan strategies or when the plugin seems stuck.
 */
export async function fullyResetBle(
  options: {
    androidNeverForLocation?: boolean;
    displayStrings?: DisplayStrings;
  } = {},
): Promise<void> {
  try {
    await BleClient.stopLEScan();
  } catch {
    // no active scan — ignore
  }
  initPromise = null;
  await initializeBle(options);
}
