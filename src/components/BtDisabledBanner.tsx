import { useBleDiagnostics } from '@/hooks/useBleDiagnostics';
import { useBleStatus } from '@/hooks/useBleStatus';
import { IonButton, IonItem, IonLabel, IonNote } from '@ionic/react';

export default function BtDisabledBanner() {
  const { isEnabled, requestEnable, requestEnablePending } = useBleStatus();
  const { platform, isNative, openBluetoothSettings } = useBleDiagnostics();

  if (isEnabled !== false) return null;

  return (
    <IonItem color="warning" lines="full">
      <IonLabel>
        <h2>Bluetooth is off</h2>
        <IonNote>Turn it on to scan and connect.</IonNote>
      </IonLabel>
      {isNative && platform === 'android' ? (
        <IonButton
          slot="end"
          fill="solid"
          color="dark"
          disabled={requestEnablePending}
          onClick={() => requestEnable()}
        >
          Enable
        </IonButton>
      ) : (
        <IonButton slot="end" fill="outline" onClick={openBluetoothSettings}>
          Settings
        </IonButton>
      )}
    </IonItem>
  );
}
