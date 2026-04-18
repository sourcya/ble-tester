import { DEFAULT_MTU } from '@/lib/ble/mtu';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { useQuery } from '@tanstack/react-query';

export function useMtu(deviceId: string | null) {
  const query = useQuery({
    queryKey: ['ble', 'mtu', deviceId],
    queryFn: async () => {
      if (!deviceId) return DEFAULT_MTU;
      try {
        return await BleClient.getMtu(deviceId);
      } catch {
        return DEFAULT_MTU;
      }
    },
    enabled: !!deviceId && Capacitor.isNativePlatform(),
  });
  return query.data ?? DEFAULT_MTU;
}
