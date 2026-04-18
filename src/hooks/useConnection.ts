import { useSettings } from '@/hooks/useSettings';
import { decodeBleError } from '@/lib/ble/attErrors';
import { initializeBle } from '@/lib/ble/client';
import { subscribeReset } from '@/lib/reset';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

export type ConnectedDevice = {
  deviceId: string;
  name?: string;
  connectedAt: number;
};

export type ConnectTarget = { deviceId: string; name?: string };

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export function useConnection() {
  const qc = useQueryClient();
  const { settings, rememberDevice } = useSettings();
  const [device, setDevice] = useState<ConnectedDevice | null>(null);

  const connect = useMutation({
    mutationFn: async (target: ConnectTarget) => {
      await initializeBle();
      await withTimeout(
        BleClient.connect(
          target.deviceId,
          () => {
            setDevice(null);
            qc.invalidateQueries({ queryKey: ['ble'] });
          },
          settings.skipDescriptorDiscovery ? { skipDescriptorDiscovery: true } : undefined,
        ),
        settings.connectTimeoutMs,
        'Connect',
      );
      return target;
    },
    onSuccess: (target) => {
      const record: ConnectedDevice = {
        deviceId: target.deviceId,
        ...(target.name !== undefined ? { name: target.name } : {}),
        connectedAt: Date.now(),
      };
      setDevice(record);
      rememberDevice({
        deviceId: target.deviceId,
        ...(target.name !== undefined ? { nickname: target.name } : {}),
        lastSeen: Date.now(),
      });
    },
    onError: (err) => {
      throw new Error(decodeBleError(err));
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      if (!device) return;
      await BleClient.disconnect(device.deviceId);
    },
    onSuccess: () => {
      setDevice(null);
      qc.invalidateQueries({ queryKey: ['ble'] });
    },
  });

  useEffect(() => {
    return () => {
      if (device) BleClient.disconnect(device.deviceId).catch(() => {});
    };
  }, [device]);

  useEffect(() => {
    return subscribeReset(() => {
      if (device) BleClient.disconnect(device.deviceId).catch(() => {});
      setDevice(null);
      connect.reset();
      disconnect.reset();
      qc.clear();
    });
  }, [device, connect, disconnect, qc]);

  const connectTo = useCallback(
    (target: ConnectTarget) => {
      connect.reset();
      connect.mutate(target);
    },
    [connect],
  );

  const cancelConnect = useCallback(async () => {
    connect.reset();
    // best-effort abort: disconnect if an in-flight connect has partially registered the device
  }, [connect]);

  return {
    device,
    isConnected: device !== null,
    connectTo,
    cancelConnect,
    connectError: connect.error,
    connecting: connect.isPending,
    disconnect: disconnect.mutate,
    disconnecting: disconnect.isPending,
  };
}
