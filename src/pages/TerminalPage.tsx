import BtDisabledBanner from '@/components/BtDisabledBanner';
import CharacteristicSheet from '@/components/CharacteristicSheet';
import ConnectingOverlay from '@/components/ConnectingOverlay';
import ConnectionHeader from '@/components/ConnectionHeader';
import FiltersSheet from '@/components/FiltersSheet';
import LiveScanList from '@/components/LiveScanList';
import ScanControls from '@/components/ScanControls';
import ServiceList from '@/components/ServiceList';
import TerminalLog from '@/components/TerminalLog';
import TopBar from '@/components/TopBar';
import { type ConnectTarget, useConnection } from '@/hooks/useConnection';
import { useLiveScan } from '@/hooks/useLiveScan';
import { useNotify } from '@/hooks/useNotify';
import { useRead } from '@/hooks/useRead';
import { useServices } from '@/hooks/useServices';
import { useSettings } from '@/hooks/useSettings';
import { useTerminalLog } from '@/hooks/useTerminalLog';
import { useWrite } from '@/hooks/useWrite';
import { decodeBleError } from '@/lib/ble/attErrors';
import { canUseLiveScan } from '@/lib/ble/capabilities';
import type { Characteristic, Service, TerminalEntry } from '@/schemas/ble';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { IonButton, IonContent, IonIcon, IonPage, IonToast } from '@ionic/react';
import { funnelOutline } from 'ionicons/icons';
import { useEffect, useMemo, useState } from 'react';

export default function TerminalPage() {
  const { settings, setFilters } = useSettings();
  const scan = useLiveScan();
  const connection = useConnection();
  const services = useServices(connection.device?.deviceId ?? null);
  const read = useRead(connection.device?.deviceId ?? null);
  const write = useWrite(connection.device?.deviceId ?? null);
  const notify = useNotify(connection.device?.deviceId ?? null);
  const { entries, historyFor } = useTerminalLog();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selection, setSelection] = useState<{ service: Service; char: Characteristic } | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [pendingTarget, setPendingTarget] = useState<ConnectTarget | null>(null);

  useEffect(() => {
    if (connection.connectError) {
      setToast(
        connection.connectError instanceof Error
          ? connection.connectError.message
          : String(connection.connectError),
      );
      setPendingTarget(null);
    }
  }, [connection.connectError]);

  useEffect(() => {
    if (connection.isConnected) setPendingTarget(null);
  }, [connection.isConnected]);

  useEffect(() => {
    if (read.error) setToast(read.error.message);
  }, [read.error]);
  useEffect(() => {
    if (write.error) setToast(write.error.message);
  }, [write.error]);
  useEffect(() => {
    if (scan.error) setToast(scan.error.message);
  }, [scan.error]);

  const notifyingKeys = useMemo(() => new Set(notify.active), [notify.active]);
  const selectedKey = selection ? `${selection.service.uuid}|${selection.char.uuid}` : '';

  const startConnect = (target: ConnectTarget) => {
    setPendingTarget(target);
    connection.connectTo(target);
  };

  const effectiveStrategy =
    settings.scanStrategy === 'live' && !canUseLiveScan() ? 'picker' : settings.scanStrategy;

  // If a live scan is running but we're now in picker mode, stop it.
  useEffect(() => {
    if (effectiveStrategy === 'picker' && scan.isScanning) {
      scan.stop().catch(() => {});
    }
  }, [effectiveStrategy, scan.isScanning, scan.stop]);

  /**
   * Uses the plugin's BleClient.requestDevice / requestLEScan directly —
   * this app is a tester for the @capacitor-community/bluetooth-le plugin,
   * so we exercise its public surface.
   */
  const onStartScan = () => {
    console.log('[ble-tester] onStartScan click; strategy =', effectiveStrategy);
    if (effectiveStrategy === 'picker') {
      if (scan.isScanning) {
        scan.stop();
      }
      const filters = settings.filters;
      const hasServices = Array.isArray(filters.services) && filters.services.length > 0;
      const hasOptional =
        Array.isArray(filters.optionalServices) && filters.optionalServices.length > 0;
      const options = {
        ...(filters.name ? { name: filters.name } : {}),
        ...(filters.namePrefix ? { namePrefix: filters.namePrefix } : {}),
        ...(hasServices ? { services: filters.services } : {}),
        ...(hasOptional ? { optionalServices: filters.optionalServices } : {}),
      };
      console.log('[ble-tester] BleClient.requestDevice', options);
      BleClient.requestDevice(options)
        .then((device) => {
          console.log('[ble-tester] requestDevice resolved', device);
          startConnect({
            deviceId: device.deviceId,
            ...(device.name ? { name: device.name } : {}),
          });
        })
        .catch((err) => {
          console.error('[ble-tester] requestDevice rejected', err);
          const raw = err instanceof Error ? err.message : String(err);
          const isCancel = /user cancel|chooser|cancelled|notfounderror/i.test(raw);
          setToast(isCancel ? `Picker dismissed: ${raw}` : decodeBleError(err));
        });
    } else {
      scan.start(settings.filters, settings.scanTimeoutMs).catch((err) => {
        console.error('[ble-tester] live scan start failed', err);
      });
    }
  };

  const onStopScan = () => {
    scan.stop().catch(() => {});
  };

  const pendingLabel = pendingTarget?.name || pendingTarget?.deviceId || '';

  return (
    <IonPage>
      <TopBar
        title="BLE Terminal"
        endButtons={
          <IonButton onClick={() => setFiltersOpen(true)} aria-label="Filters">
            <IonIcon slot="icon-only" icon={funnelOutline} />
          </IonButton>
        }
      />
      <IonContent>
        <BtDisabledBanner />

        {!connection.isConnected ? (
          <>
            <ScanControls
              strategy={effectiveStrategy}
              isScanning={scan.isScanning}
              endsAt={scan.endsAt}
              deviceCount={scan.devices.length}
              error={scan.error}
              onStart={onStartScan}
              onStop={onStopScan}
            />
            {effectiveStrategy === 'live' ? (
              <LiveScanList devices={scan.devices} onConnect={startConnect} />
            ) : null}
          </>
        ) : (
          <>
            <ConnectionHeader
              device={connection.device!}
              onDisconnect={() => connection.disconnect()}
            />
            <ServiceList
              services={services.services}
              isLoading={services.isLoading || services.rediscovering}
              error={services.error}
              onSelectCharacteristic={(svc, ch) => setSelection({ service: svc, char: ch })}
              onRetry={services.refetch}
              onRediscover={services.rediscover}
              notifyingKeys={notifyingKeys}
            />
          </>
        )}

        <TerminalLog entries={entries} />

        <ConnectingOverlay
          isOpen={connection.connecting}
          deviceLabel={pendingLabel}
          onCancel={() => {
            connection.cancelConnect();
            setPendingTarget(null);
          }}
        />
        <FiltersSheet
          isOpen={filtersOpen}
          filters={settings.filters}
          onClose={() => setFiltersOpen(false)}
          onSave={setFilters}
        />
        <CharacteristicSheet
          isOpen={selection !== null}
          service={selection?.service ?? null}
          characteristic={selection?.char ?? null}
          onClose={() => setSelection(null)}
          onRead={() =>
            selection &&
            read.mutate({ service: selection.service.uuid, characteristic: selection.char.uuid })
          }
          onWrite={(bytes, withoutResponse) =>
            selection &&
            write.mutate({
              service: selection.service.uuid,
              characteristic: selection.char.uuid,
              bytes,
              withoutResponse,
            })
          }
          onToggleNotify={(shouldStart) => {
            if (!selection) return;
            if (shouldStart) {
              notify.start(selection.service.uuid, selection.char.uuid);
            } else {
              notify.stop(selection.service.uuid, selection.char.uuid);
            }
          }}
          isNotifying={notifyingKeys.has(selectedKey)}
          history={selection ? historyFor(selection.char.uuid) : []}
          onReplay={(entry: TerminalEntry) => {
            if (!selection) return;
            write.mutate({
              service: selection.service.uuid,
              characteristic: selection.char.uuid,
              bytes: entry.bytes,
              withoutResponse: entry.kind === 'writeNoResponse',
            });
          }}
        />

        <IonToast
          isOpen={!!toast}
          onDidDismiss={() => setToast(null)}
          message={toast ?? ''}
          duration={4000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
}
