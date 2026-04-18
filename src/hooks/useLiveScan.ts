import { initializeBle } from '@/lib/ble/client';
import { subscribeReset } from '@/lib/reset';
import type { Filters } from '@/schemas/ble';
import { BleClient, type ScanResult } from '@capacitor-community/bluetooth-le';
import { useCallback, useEffect, useRef, useState } from 'react';

const LOG = '[ble-tester:useLiveScan]';

export type LiveScanEntry = {
  deviceId: string;
  name?: string;
  localName?: string;
  rssi?: number;
  txPower?: number;
  uuids: string[];
  manufacturerData: Record<string, number[]>;
  serviceData: Record<string, number[]>;
  lastSeen: number;
  seenCount: number;
};

function dvToBytes(dv: DataView | undefined): number[] {
  if (!dv) return [];
  return Array.from(new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength));
}

function dvMapToObject(map: { [k: string]: DataView } | undefined): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  if (!map) return out;
  for (const [k, v] of Object.entries(map)) out[k] = dvToBytes(v);
  return out;
}

function toEntry(prev: LiveScanEntry | undefined, r: ScanResult): LiveScanEntry {
  return {
    deviceId: r.device.deviceId,
    ...(r.device.name ? { name: r.device.name } : {}),
    ...(r.localName ? { localName: r.localName } : {}),
    ...(r.rssi !== undefined ? { rssi: r.rssi } : {}),
    ...(r.txPower !== undefined ? { txPower: r.txPower } : {}),
    uuids: r.uuids ?? [],
    manufacturerData: dvMapToObject(r.manufacturerData),
    serviceData: dvMapToObject(r.serviceData),
    lastSeen: Date.now(),
    seenCount: (prev?.seenCount ?? 0) + 1,
  };
}

export function useLiveScan() {
  const [devices, setDevices] = useState<Map<string, LiveScanEntry>>(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const scanningRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setEndsAt(null);
  }, []);

  const stop = useCallback(async () => {
    const wasScanning = scanningRef.current;
    scanningRef.current = false;
    setIsScanning(false);
    clearTimer();
    if (!wasScanning) return;
    try {
      console.log(LOG, 'BleClient.stopLEScan()');
      await BleClient.stopLEScan();
    } catch (err) {
      console.warn(LOG, 'stopLEScan threw', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [clearTimer]);

  const start = useCallback(
    (filters: Filters, timeoutMs: number): Promise<void> => {
      if (scanningRef.current) return Promise.resolve();
      setError(null);
      setDevices(new Map());
      scanningRef.current = true;
      setIsScanning(true);
      setEndsAt(Date.now() + timeoutMs);
      timeoutRef.current = setTimeout(() => {
        stop().catch(() => {});
      }, timeoutMs);

      const hasServices = Array.isArray(filters.services) && filters.services.length > 0;
      const hasOptional =
        Array.isArray(filters.optionalServices) && filters.optionalServices.length > 0;
      const options = {
        ...(filters.name ? { name: filters.name } : {}),
        ...(filters.namePrefix ? { namePrefix: filters.namePrefix } : {}),
        ...(hasServices ? { services: filters.services } : {}),
        ...(hasOptional ? { optionalServices: filters.optionalServices } : {}),
        allowDuplicates: filters.allowDuplicates,
        scanMode: filters.scanMode,
      };
      console.log(LOG, 'BleClient.requestLEScan', options);

      return (async () => {
        try {
          await initializeBle();
          await BleClient.requestLEScan(options, (result) => {
            console.log(LOG, 'onScanResult', {
              id: result.device.deviceId,
              name: result.device.name,
              rssi: result.rssi,
            });
            setDevices((prev) => {
              const next = new Map(prev);
              next.set(result.device.deviceId, toEntry(prev.get(result.device.deviceId), result));
              return next;
            });
          });
          console.log(LOG, 'requestLEScan resolved (scan active)');
        } catch (err) {
          console.error(LOG, 'requestLEScan rejected', err);
          scanningRef.current = false;
          setIsScanning(false);
          clearTimer();
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })();
    },
    [stop, clearTimer],
  );

  const clear = useCallback(() => setDevices(new Map()), []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanningRef.current) {
        BleClient.stopLEScan().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    return subscribeReset(() => {
      scanningRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      BleClient.stopLEScan().catch(() => {});
      setIsScanning(false);
      setEndsAt(null);
      setDevices(new Map());
      setError(null);
    });
  }, []);

  return {
    devices: Array.from(devices.values()),
    isScanning,
    error,
    endsAt,
    start,
    stop,
    clear,
  };
}
