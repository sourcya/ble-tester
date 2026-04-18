import { useSettings } from '@/hooks/useSettings';
import { initializeBle } from '@/lib/ble/client';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useBleStatus() {
  const { settings } = useSettings();
  const qc = useQueryClient();
  const [liveEnabled, setLiveEnabled] = useState<boolean | null>(null);

  const statusQuery = useQuery({
    queryKey: ['ble', 'status'],
    queryFn: async () => {
      await initializeBle({
        androidNeverForLocation: settings.androidNeverForLocation,
        displayStrings: settings.displayStrings,
      });
      return BleClient.isEnabled();
    },
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;
    (async () => {
      try {
        await initializeBle({
          androidNeverForLocation: settings.androidNeverForLocation,
          displayStrings: settings.displayStrings,
        });
        await BleClient.startEnabledNotifications((value) => {
          if (!cancelled) {
            setLiveEnabled(value);
            qc.setQueryData(['ble', 'status'], value);
          }
        });
      } catch (err) {
        console.warn('startEnabledNotifications failed:', err);
      }
    })();
    return () => {
      cancelled = true;
      BleClient.stopEnabledNotifications().catch(() => {});
    };
  }, [qc, settings.androidNeverForLocation, settings.displayStrings]);

  const requestEnable = useMutation({
    mutationFn: () => BleClient.requestEnable(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ble', 'status'] }),
  });

  return {
    isEnabled: liveEnabled ?? statusQuery.data ?? null,
    isLoading: statusQuery.isLoading,
    error: statusQuery.error,
    refetch: statusQuery.refetch,
    requestEnable: requestEnable.mutate,
    requestEnablePending: requestEnable.isPending,
  };
}
