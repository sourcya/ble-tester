import type { ScanStrategy } from '@/schemas/ble';
import { IonButton, IonIcon, IonNote, IonSpinner } from '@ionic/react';
import { playCircleOutline, stopCircleOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';

type Props = {
  strategy: ScanStrategy;
  isScanning: boolean;
  endsAt: number | null;
  deviceCount: number;
  error?: Error | null;
  onStart: () => void;
  onStop: () => void;
};

function useCountdown(endsAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endsAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [endsAt]);
  if (endsAt === null) return 0;
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export default function ScanControls({
  strategy,
  isScanning,
  endsAt,
  deviceCount,
  error,
  onStart,
  onStop,
}: Props) {
  const remaining = useCountdown(endsAt);
  const showStop = strategy === 'live' && isScanning;

  return (
    <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
      {showStop ? (
        <IonButton color="danger" onClick={onStop}>
          <IonIcon slot="start" icon={stopCircleOutline} />
          Stop
        </IonButton>
      ) : (
        <IonButton onClick={onStart}>
          <IonIcon slot="start" icon={playCircleOutline} />
          {strategy === 'picker' ? 'Pick device' : 'Scan'}
        </IonButton>
      )}
      {showStop ? (
        <>
          <IonSpinner name="dots" />
          <IonNote>{remaining}s left</IonNote>
        </>
      ) : null}
      <IonNote className="ml-auto">
        {deviceCount} {deviceCount === 1 ? 'device' : 'devices'}
      </IonNote>
      {error ? (
        <IonNote className="w-full" color="danger">
          {error.message}
        </IonNote>
      ) : null}
    </div>
  );
}
