import { useTerminalLog } from '@/hooks/useTerminalLog';
import { decodeBleError } from '@/lib/ble/attErrors';
import { BleClient, dataViewToNumbers } from '@capacitor-community/bluetooth-le';
import { useCallback, useEffect, useRef, useState } from 'react';

type Subscription = { service: string; characteristic: string };

export function useNotify(deviceId: string | null) {
  const { addEntry } = useTerminalLog();
  const activeRef = useRef<Map<string, Subscription>>(new Map());
  const [active, setActive] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const start = useCallback(
    async (service: string, characteristic: string) => {
      if (!deviceId) return;
      const key = `${service}|${characteristic}`;
      if (activeRef.current.has(key)) return;
      try {
        await BleClient.startNotifications(deviceId, service, characteristic, (dv) => {
          addEntry({
            charUuid: characteristic,
            direction: 'in',
            kind: 'notify',
            bytes: dataViewToNumbers(dv),
          });
        });
        activeRef.current.set(key, { service, characteristic });
        setActive(Array.from(activeRef.current.keys()));
      } catch (err) {
        setError(new Error(decodeBleError(err)));
      }
    },
    [deviceId, addEntry],
  );

  const stop = useCallback(
    async (service: string, characteristic: string) => {
      if (!deviceId) return;
      const key = `${service}|${characteristic}`;
      try {
        await BleClient.stopNotifications(deviceId, service, characteristic);
      } catch (err) {
        setError(new Error(decodeBleError(err)));
      } finally {
        activeRef.current.delete(key);
        setActive(Array.from(activeRef.current.keys()));
      }
    },
    [deviceId],
  );

  const stopAll = useCallback(async () => {
    const entries = Array.from(activeRef.current.values());
    activeRef.current.clear();
    setActive([]);
    if (!deviceId) return;
    await Promise.allSettled(
      entries.map((e) => BleClient.stopNotifications(deviceId, e.service, e.characteristic)),
    );
  }, [deviceId]);

  useEffect(() => {
    return () => {
      stopAll().catch(() => {});
    };
  }, [stopAll]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: depend on `active` so callers re-render when the set changes
  const isActive = useCallback(
    (service: string, characteristic: string) =>
      activeRef.current.has(`${service}|${characteristic}`),
    [active],
  );

  return { start, stop, stopAll, active, isActive, error };
}
