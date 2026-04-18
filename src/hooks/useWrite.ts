import { useMtu } from '@/hooks/useMtu';
import { useTerminalLog } from '@/hooks/useTerminalLog';
import { decodeBleError } from '@/lib/ble/attErrors';
import { chunkBytes } from '@/lib/ble/mtu';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { useMutation } from '@tanstack/react-query';

export type WriteArgs = {
  service: string;
  characteristic: string;
  bytes: number[];
  /**
   * If true (and supported), use writeWithoutResponse for every chunk.
   * If false, use write for every chunk.
   */
  withoutResponse: boolean;
};

export function useWrite(deviceId: string | null) {
  const mtu = useMtu(deviceId);
  const { addEntry } = useTerminalLog();

  return useMutation({
    mutationFn: async (args: WriteArgs) => {
      if (!deviceId) throw new Error('Not connected');
      const chunks = chunkBytes(args.bytes, mtu);
      for (const dv of chunks) {
        if (args.withoutResponse) {
          await BleClient.writeWithoutResponse(deviceId, args.service, args.characteristic, dv);
        } else {
          await BleClient.write(deviceId, args.service, args.characteristic, dv);
        }
        addEntry({
          charUuid: args.characteristic,
          direction: 'out',
          kind: args.withoutResponse ? 'writeNoResponse' : 'write',
          bytes: Array.from(new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength)),
        });
      }
      return { chunkCount: chunks.length };
    },
    onError: (err) => {
      throw new Error(decodeBleError(err));
    },
  });
}
