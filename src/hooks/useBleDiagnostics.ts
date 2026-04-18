import { BleClient } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

function safe(fn: () => Promise<void>): () => Promise<void> {
  return async () => {
    try {
      await fn();
    } catch (err) {
      console.warn('diagnostics action failed:', err);
    }
  };
}

export function useBleDiagnostics() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  const locationEnabledQuery = useQuery({
    queryKey: ['ble', 'locationEnabled'],
    queryFn: () => BleClient.isLocationEnabled(),
    enabled: isNative && platform === 'android',
  });

  const openBluetoothSettings = useCallback(
    safe(() => BleClient.openBluetoothSettings()),
    [],
  );
  const openLocationSettings = useCallback(
    safe(() => BleClient.openLocationSettings()),
    [],
  );
  const openAppSettings = useCallback(
    safe(() => BleClient.openAppSettings()),
    [],
  );

  return {
    isLocationEnabled: locationEnabledQuery.data,
    platform,
    isNative,
    openBluetoothSettings,
    openLocationSettings,
    openAppSettings,
  };
}
