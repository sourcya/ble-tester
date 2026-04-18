import { BleClient, ConnectionPriority } from '@capacitor-community/bluetooth-le';
import { useMutation } from '@tanstack/react-query';

export type ConnectionPriorityLabel = 'balanced' | 'high' | 'low-power';

const MAP: Record<ConnectionPriorityLabel, ConnectionPriority> = {
  balanced: ConnectionPriority.CONNECTION_PRIORITY_BALANCED,
  high: ConnectionPriority.CONNECTION_PRIORITY_HIGH,
  'low-power': ConnectionPriority.CONNECTION_PRIORITY_LOW_POWER,
};

export function useConnectionPriority(deviceId: string | null) {
  return useMutation({
    mutationFn: async (label: ConnectionPriorityLabel) => {
      if (!deviceId) return;
      await BleClient.requestConnectionPriority(deviceId, MAP[label]);
    },
  });
}
