import { decodeBleError } from '@/lib/ble/attErrors';
import { type Service, ServiceSchema } from '@/schemas/ble';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

const ServiceListSchema = z.array(ServiceSchema);

export function useServices(deviceId: string | null) {
  const qc = useQueryClient();

  const query = useQuery<Service[], Error>({
    queryKey: ['ble', 'services', deviceId],
    queryFn: async () => {
      if (!deviceId) return [];
      try {
        const raw = await BleClient.getServices(deviceId);
        return ServiceListSchema.parse(raw);
      } catch (err) {
        throw new Error(decodeBleError(err));
      }
    },
    enabled: !!deviceId,
    retry: false,
  });

  const rediscover = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!deviceId) return;
      try {
        await BleClient.discoverServices(deviceId);
      } catch (err) {
        throw new Error(decodeBleError(err));
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ble', 'services', deviceId] }),
  });

  return {
    services: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ?? rediscover.error,
    refetch: () => query.refetch(),
    rediscover: () => rediscover.mutate(),
    rediscovering: rediscover.isPending,
  };
}
