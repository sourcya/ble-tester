import DisplayStringsModal from '@/components/DisplayStringsModal';
import RecentDevicesModal from '@/components/RecentDevicesModal';
import TopBar from '@/components/TopBar';
import { useBleDiagnostics } from '@/hooks/useBleDiagnostics';
import { useSettings } from '@/hooks/useSettings';
import { canUseLiveScan, hasWebBluetooth } from '@/lib/ble/capabilities';
import type { ScanStrategy } from '@/schemas/ble';
import { Capacitor } from '@capacitor/core';
import {
  IonBadge,
  IonButton,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRange,
  IonToast,
} from '@ionic/react';
import {
  bluetoothOutline,
  chevronForwardOutline,
  cogOutline,
  informationCircleOutline,
  locationOutline,
  refreshOutline,
  timeOutline,
} from 'ionicons/icons';
import { useState } from 'react';

function formatSeconds(ms: number): string {
  return `${Math.round(ms / 1000)}s`;
}

export default function SettingsPage() {
  const {
    settings,
    setDisplayStrings,
    setAndroidNeverForLocation,
    setSkipDescriptorDiscovery,
    setScanStrategy,
    setScanTimeoutMs,
    setConnectTimeoutMs,
    clearRecents,
    resetBleState,
  } = useSettings();
  const { openBluetoothSettings, openLocationSettings, openAppSettings } = useBleDiagnostics();

  const [recentsOpen, setRecentsOpen] = useState(false);
  const [displayStringsOpen, setDisplayStringsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  const isAndroid = platform === 'android';
  const liveScanAvailable = canUseLiveScan();
  const webBtAvailable = hasWebBluetooth();

  return (
    <IonPage>
      <TopBar title="Settings" />
      <IonContent className="ion-padding-bottom">
        {/* Status banner */}
        <IonList inset>
          <IonItem lines="none">
            <IonIcon
              slot="start"
              icon={isNative ? bluetoothOutline : informationCircleOutline}
              color="primary"
            />
            <IonLabel>
              <h2>
                {isNative ? `Running on ${platform}` : 'Running in browser'}{' '}
                <IonBadge color={isNative ? 'success' : 'medium'}>
                  {isNative ? 'native' : 'web'}
                </IonBadge>
              </h2>
              {!isNative ? (
                <IonNote>
                  Web Bluetooth:{' '}
                  {webBtAvailable ? (
                    <span style={{ color: 'var(--ion-color-success)' }}>available</span>
                  ) : (
                    <span style={{ color: 'var(--ion-color-danger)' }}>unavailable</span>
                  )}
                  {' · '}requestLEScan:{' '}
                  {liveScanAvailable ? (
                    <span style={{ color: 'var(--ion-color-success)' }}>enabled</span>
                  ) : (
                    <span style={{ color: 'var(--ion-color-warning)' }}>flag required</span>
                  )}
                </IonNote>
              ) : null}
            </IonLabel>
          </IonItem>
        </IonList>

        {/* Scanning */}
        <IonList inset>
          <IonListHeader>
            <IonLabel>Scanning</IonLabel>
          </IonListHeader>
          <IonRadioGroup
            value={settings.scanStrategy}
            onIonChange={(e) => {
              const next = e.detail.value as ScanStrategy;
              if (next !== settings.scanStrategy) {
                if (!isNative) {
                  setToast('Applying strategy — reloading page…');
                }
                setScanStrategy(next);
              }
            }}
          >
            <IonItem>
              <IonRadio value="picker">
                <IonLabel>
                  <h3>Picker</h3>
                  <IonNote>Opens the system or browser Bluetooth chooser.</IonNote>
                </IonLabel>
              </IonRadio>
            </IonItem>
            <IonItem lines="none">
              <IonRadio value="live" disabled={!liveScanAvailable}>
                <IonLabel>
                  <h3>
                    Live scan {liveScanAvailable ? null : <IonBadge color="medium">n/a</IonBadge>}
                  </h3>
                  <IonNote>
                    {liveScanAvailable
                      ? 'Streams every advertisement with RSSI and adv data.'
                      : 'Enable chrome://flags/#enable-experimental-web-platform-features to unlock on web.'}
                  </IonNote>
                </IonLabel>
              </IonRadio>
            </IonItem>
          </IonRadioGroup>
        </IonList>

        {/* Timeouts */}
        <IonList inset>
          <IonListHeader>
            <IonLabel>Timeouts</IonLabel>
          </IonListHeader>
          <IonItem lines="full">
            <IonIcon slot="start" icon={timeOutline} />
            <IonLabel>
              <h3>Scan · {formatSeconds(settings.scanTimeoutMs)}</h3>
              <IonRange
                aria-label="Scan timeout"
                min={5000}
                max={60000}
                step={1000}
                value={settings.scanTimeoutMs}
                onIonChange={(e) => setScanTimeoutMs(Number(e.detail.value))}
              />
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonIcon slot="start" icon={timeOutline} />
            <IonLabel>
              <h3>Connect · {formatSeconds(settings.connectTimeoutMs)}</h3>
              <IonRange
                aria-label="Connect timeout"
                min={5000}
                max={45000}
                step={1000}
                value={settings.connectTimeoutMs}
                onIonChange={(e) => setConnectTimeoutMs(Number(e.detail.value))}
              />
            </IonLabel>
          </IonItem>
        </IonList>

        {/* Connection flags (native) */}
        {isNative ? (
          <IonList inset>
            <IonListHeader>
              <IonLabel>Connection</IonLabel>
            </IonListHeader>
            <IonItem lines={isAndroid ? 'full' : 'none'}>
              <IonCheckbox
                checked={settings.skipDescriptorDiscovery}
                onIonChange={(e) => setSkipDescriptorDiscovery(e.detail.checked)}
              >
                <IonLabel>
                  <h3>Skip descriptor discovery</h3>
                  <IonNote>Faster connect; descriptors unavailable.</IonNote>
                </IonLabel>
              </IonCheckbox>
            </IonItem>
            {isAndroid ? (
              <IonItem lines="none">
                <IonCheckbox
                  checked={settings.androidNeverForLocation}
                  onIonChange={(e) => setAndroidNeverForLocation(e.detail.checked)}
                >
                  <IonLabel>
                    <h3>Never for location</h3>
                    <IonNote>Scan without fine location on Android 12+.</IonNote>
                  </IonLabel>
                </IonCheckbox>
              </IonItem>
            ) : null}
          </IonList>
        ) : null}

        {/* Detail rows */}
        <IonList inset>
          {isNative ? (
            <IonItem button onClick={() => setDisplayStringsOpen(true)}>
              <IonIcon slot="start" icon={cogOutline} />
              <IonLabel>
                <h3>Picker dialog labels</h3>
                <IonNote>Custom strings shown in the native chooser.</IonNote>
              </IonLabel>
              <IonIcon slot="end" icon={chevronForwardOutline} />
            </IonItem>
          ) : null}
          <IonItem button onClick={() => setRecentsOpen(true)} lines="full">
            <IonIcon slot="start" icon={bluetoothOutline} />
            <IonLabel>
              <h3>Recent devices</h3>
              <IonNote>Last 10 connected peripherals.</IonNote>
            </IonLabel>
            <IonBadge slot="end" color="medium">
              {settings.recents.length}
            </IonBadge>
            <IonIcon slot="end" icon={chevronForwardOutline} />
          </IonItem>
        </IonList>

        {/* System shortcuts (native) */}
        {isNative ? (
          <IonList inset>
            <IonListHeader>
              <IonLabel>Open system settings</IonLabel>
            </IonListHeader>
            <IonItem button onClick={openBluetoothSettings}>
              <IonIcon slot="start" icon={bluetoothOutline} />
              <IonLabel>Bluetooth</IonLabel>
            </IonItem>
            {isAndroid ? (
              <IonItem button onClick={openLocationSettings}>
                <IonIcon slot="start" icon={locationOutline} />
                <IonLabel>Location</IonLabel>
              </IonItem>
            ) : null}
            <IonItem button onClick={openAppSettings} lines="none">
              <IonIcon slot="start" icon={cogOutline} />
              <IonLabel>App</IonLabel>
            </IonItem>
          </IonList>
        ) : null}

        {/* Maintenance */}
        <IonList inset>
          <IonListHeader>
            <IonLabel>Maintenance</IonLabel>
          </IonListHeader>
          <IonItem lines="none">
            <IonLabel>
              <h3>Reset BLE state</h3>
              <IonNote>
                Disconnects, stops scanning, clears log + cache, re-initializes the plugin.
              </IonNote>
            </IonLabel>
          </IonItem>
          <div className="px-4 pb-4">
            <IonButton
              expand="block"
              color="warning"
              onClick={async () => {
                try {
                  await resetBleState();
                  setToast('BLE state reset');
                } catch (err) {
                  setToast(err instanceof Error ? err.message : String(err));
                }
              }}
            >
              <IonIcon slot="start" icon={refreshOutline} />
              Reset now
            </IonButton>
          </div>
        </IonList>

        {/* Modals */}
        {isNative ? (
          <DisplayStringsModal
            isOpen={displayStringsOpen}
            displayStrings={settings.displayStrings}
            onClose={() => setDisplayStringsOpen(false)}
            onSave={setDisplayStrings}
          />
        ) : null}
        <RecentDevicesModal
          isOpen={recentsOpen}
          recents={settings.recents}
          onClose={() => setRecentsOpen(false)}
          onClearAll={clearRecents}
        />

        <IonToast
          isOpen={!!toast}
          onDidDismiss={() => setToast(null)}
          message={toast ?? ''}
          duration={2500}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
}
