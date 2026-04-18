import { resetAll } from '@/lib/reset';
import { readJson, writeJson } from '@/lib/storage';
import { DEFAULT_SETTINGS, type RecentDevice, type Settings, SettingsSchema } from '@/schemas/ble';
import { Capacitor } from '@capacitor/core';
import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ble-tester:settings';

function migrateLegacy(): Partial<Settings> | null {
  try {
    const prefix = localStorage.getItem('prefix');
    const optionalService = localStorage.getItem('optionalService');
    if (prefix === null && optionalService === null) return null;
    const filters: Settings['filters'] = { ...DEFAULT_SETTINGS.filters };
    if (prefix) filters.namePrefix = prefix;
    if (optionalService) filters.optionalServices = [optionalService];
    localStorage.removeItem('prefix');
    localStorage.removeItem('optionalService');
    return { filters };
  } catch {
    return null;
  }
}

function load(): Settings {
  const base = readJson(STORAGE_KEY, SettingsSchema, DEFAULT_SETTINGS);
  if (base !== DEFAULT_SETTINGS) return base;
  const legacy = migrateLegacy();
  if (legacy) {
    const merged: Settings = { ...DEFAULT_SETTINGS, ...legacy };
    writeJson(STORAGE_KEY, merged);
    return merged;
  }
  return base;
}

let cached = load();
const subscribers = new Set<() => void>();

function subscribe(cb: () => void) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function getSnapshot(): Settings {
  return cached;
}

function update(partial: Partial<Settings>): void {
  cached = { ...cached, ...partial };
  writeJson(STORAGE_KEY, cached);
  for (const cb of subscribers) cb();
}

export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setFilters = useCallback((filters: Settings['filters']) => update({ filters }), []);
  const setDisplayStrings = useCallback(
    (displayStrings: Settings['displayStrings']) => update({ displayStrings }),
    [],
  );
  const setAndroidNeverForLocation = useCallback(
    (androidNeverForLocation: boolean) => update({ androidNeverForLocation }),
    [],
  );
  const setSkipDescriptorDiscovery = useCallback(
    (skipDescriptorDiscovery: boolean) => update({ skipDescriptorDiscovery }),
    [],
  );
  const setScanStrategy = useCallback((scanStrategy: Settings['scanStrategy']) => {
    if (cached.scanStrategy === scanStrategy) return;
    update({ scanStrategy });
    resetAll({
      androidNeverForLocation: cached.androidNeverForLocation,
      displayStrings: cached.displayStrings,
    }).catch((err) => {
      console.warn('resetAll failed:', err);
    });

    // Chrome's Web Bluetooth holds internal chooser / scan state for the
    // lifetime of the document. Once either requestLEScan or requestDevice has
    // been called, switching to the other API often hangs silently — even
    // after stopping the previous handle. A full page reload is the only
    // reliable way to reset that state, so we do it automatically whenever a
    // web user changes scan strategy.
    if (!Capacitor.isNativePlatform()) {
      console.log('[ble-tester] reloading page after strategy change to reset Chrome BT state');
      setTimeout(() => window.location.reload(), 120);
    }
  }, []);
  const setScanTimeoutMs = useCallback((scanTimeoutMs: number) => update({ scanTimeoutMs }), []);
  const setConnectTimeoutMs = useCallback(
    (connectTimeoutMs: number) => update({ connectTimeoutMs }),
    [],
  );
  const rememberDevice = useCallback((device: RecentDevice) => {
    const filtered = cached.recents.filter((r) => r.deviceId !== device.deviceId);
    const recents = [device, ...filtered].slice(0, 10);
    update({ recents });
  }, []);
  const renameDevice = useCallback((deviceId: string, nickname: string) => {
    const recents = cached.recents.map((r) => (r.deviceId === deviceId ? { ...r, nickname } : r));
    update({ recents });
  }, []);
  const clearRecents = useCallback(() => update({ recents: [] }), []);

  const resetBleState = useCallback(
    () =>
      resetAll({
        androidNeverForLocation: cached.androidNeverForLocation,
        displayStrings: cached.displayStrings,
      }),
    [],
  );

  return {
    settings,
    setFilters,
    setDisplayStrings,
    setAndroidNeverForLocation,
    setSkipDescriptorDiscovery,
    setScanStrategy,
    setScanTimeoutMs,
    setConnectTimeoutMs,
    rememberDevice,
    renameDevice,
    clearRecents,
    resetBleState,
  };
}
