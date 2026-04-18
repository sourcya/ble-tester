import { decodeBleError } from '@/lib/ble/attErrors';
import { BleClient, dataViewToNumbers, numbersToDataView } from '@capacitor-community/bluetooth-le';
import { useMutation } from '@tanstack/react-query';

export function useDescriptor(deviceId: string | null) {
  const read = useMutation({
    mutationFn: async (args: { service: string; characteristic: string; descriptor: string }) => {
      if (!deviceId) throw new Error('Not connected');
      const dv = await BleClient.readDescriptor(
        deviceId,
        args.service,
        args.characteristic,
        args.descriptor,
      );
      return dataViewToNumbers(dv);
    },
    onError: (err) => {
      throw new Error(decodeBleError(err));
    },
  });

  const write = useMutation({
    mutationFn: async (args: {
      service: string;
      characteristic: string;
      descriptor: string;
      bytes: number[];
    }) => {
      if (!deviceId) throw new Error('Not connected');
      await BleClient.writeDescriptor(
        deviceId,
        args.service,
        args.characteristic,
        args.descriptor,
        numbersToDataView(args.bytes),
      );
    },
    onError: (err) => {
      throw new Error(decodeBleError(err));
    },
  });

  return { read, write };
}
