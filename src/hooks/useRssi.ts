import { BleClient } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

const MAX_SAMPLES = 60;

export function useRssi(deviceId: string | null) {
  const samplesRef = useRef<number[]>([]);

  const query = useQuery({
    queryKey: ['ble', 'rssi', deviceId],
    queryFn: async () => {
      if (!deviceId) return null;
      return BleClient.readRssi(deviceId);
    },
    enabled: !!deviceId && Capacitor.isNativePlatform(),
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (typeof query.data === 'number') {
      samplesRef.current = [...samplesRef.current, query.data].slice(-MAX_SAMPLES);
    }
  }, [query.data]);

  return {
    rssi: query.data ?? null,
    samples: samplesRef.current,
  };
}
