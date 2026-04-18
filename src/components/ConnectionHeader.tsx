import type { ConnectedDevice } from '@/hooks/useConnection';
import { type ConnectionPriorityLabel, useConnectionPriority } from '@/hooks/useConnectionPriority';
import { useMtu } from '@/hooks/useMtu';
import { useRssi } from '@/hooks/useRssi';
import { IonButton, IonItem, IonLabel, IonNote, IonSelect, IonSelectOption } from '@ionic/react';
import RssiSparkline from './RssiSparkline';

type Props = {
  device: ConnectedDevice;
  onDisconnect: () => void;
};

export default function ConnectionHeader({ device, onDisconnect }: Props) {
  const { rssi, samples } = useRssi(device.deviceId);
  const mtu = useMtu(device.deviceId);
  const priority = useConnectionPriority(device.deviceId);

  return (
    <IonItem lines="full">
      <IonLabel>
        <h2>{device.name || '(unnamed)'}</h2>
        <IonNote>
          {device.deviceId} · MTU {mtu} {rssi !== null ? `· ${rssi} dBm` : ''}
        </IonNote>
        <div className="mt-1">
          <RssiSparkline samples={samples} />
        </div>
      </IonLabel>
      <div slot="end" className="flex flex-col gap-1 items-end">
        <IonSelect
          aria-label="Connection priority"
          placeholder="Priority"
          interface="popover"
          onIonChange={(e) => priority.mutate(e.detail.value as ConnectionPriorityLabel)}
        >
          <IonSelectOption value="balanced">Balanced</IonSelectOption>
          <IonSelectOption value="high">High</IonSelectOption>
          <IonSelectOption value="low-power">Low power</IonSelectOption>
        </IonSelect>
        <IonButton size="small" color="danger" onClick={onDisconnect}>
          Disconnect
        </IonButton>
      </div>
    </IonItem>
  );
}
