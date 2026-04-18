import type { LiveScanEntry } from '@/hooks/useLiveScan';
import { IonItem, IonLabel, IonList, IonNote } from '@ionic/react';

type Props = {
  devices: LiveScanEntry[];
  onConnect: (entry: LiveScanEntry) => void;
};

function rssiBars(rssi: number | undefined): string {
  if (rssi === undefined) return '—';
  if (rssi >= -55) return '▁▂▃▄▅';
  if (rssi >= -65) return '▁▂▃▄';
  if (rssi >= -75) return '▁▂▃';
  if (rssi >= -85) return '▁▂';
  return '▁';
}

export default function LiveScanList({ devices, onConnect }: Props) {
  const sorted = [...devices].sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));
  return (
    <IonList>
      {sorted.map((d) => (
        <IonItem key={d.deviceId} button onClick={() => onConnect(d)}>
          <IonLabel>
            <h2>{d.localName || d.name || '(unnamed)'}</h2>
            <IonNote>
              {d.deviceId} · {rssiBars(d.rssi)} {d.rssi !== undefined ? `${d.rssi} dBm` : ''}
              {d.txPower !== undefined ? ` · tx ${d.txPower}` : ''}
              {d.seenCount > 1 ? ` · seen ${d.seenCount}×` : ''}
            </IonNote>
            {d.uuids.length > 0 ? (
              <p style={{ fontSize: 10, opacity: 0.7 }}>svc: {d.uuids.join(', ')}</p>
            ) : null}
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  );
}
