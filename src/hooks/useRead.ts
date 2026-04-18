import { useTerminalLog } from '@/hooks/useTerminalLog';
import { decodeBleError } from '@/lib/ble/attErrors';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { dataViewToNumbers } from '@capacitor-community/bluetooth-le';
import { useMutation } from '@tanstack/react-query';

export function useRead(deviceId: string | null) {
  const { addEntry } = useTerminalLog();

  return useMutation({
    mutationFn: async (args: { service: string; characteristic: string }) => {
      if (!deviceId) throw new Error('Not connected');
      const dv = await BleClient.read(deviceId, args.service, args.characteristic);
      const bytes = dataViewToNumbers(dv);
      addEntry({
        charUuid: args.characteristic,
        direction: 'in',
        kind: 'read',
        bytes,
      });
      return bytes;
    },
    onError: (err) => {
      throw new Error(decodeBleError(err));
    },
  });
}
