import { labelFor } from '@/lib/ble/assignedNumbers';
import type { Characteristic, CharacteristicProps, Service } from '@/schemas/ble';
import {
  IonBadge,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonSpinner,
} from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';

type Props = {
  services: Service[];
  isLoading: boolean;
  error: unknown;
  onSelectCharacteristic: (service: Service, characteristic: Characteristic) => void;
  onRetry: () => void;
  onRediscover: () => void;
  notifyingKeys?: Set<string>;
};

const PROP_KEYS: Array<keyof CharacteristicProps> = [
  'read',
  'write',
  'writeWithoutResponse',
  'notify',
  'indicate',
  'broadcast',
  'authenticatedSignedWrites',
  'reliableWrite',
];

const PROP_LABEL: Partial<Record<keyof CharacteristicProps, string>> = {
  read: 'R',
  write: 'W',
  writeWithoutResponse: 'WNR',
  notify: 'N',
  indicate: 'I',
  broadcast: 'B',
  authenticatedSignedWrites: 'AS',
  reliableWrite: 'RW',
};

function PropBadges({ props }: { props: CharacteristicProps }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {PROP_KEYS.filter((k) => props[k]).map((k) => (
        <IonBadge key={k} color="primary">
          {PROP_LABEL[k] ?? k}
        </IonBadge>
      ))}
    </div>
  );
}

export default function ServiceList({
  services,
  isLoading,
  error,
  onSelectCharacteristic,
  onRetry,
  onRediscover,
  notifyingKeys,
}: Props) {
  if (isLoading) {
    return (
      <IonItem lines="none">
        <IonSpinner name="dots" slot="start" />
        <IonLabel>Discovering services…</IonLabel>
      </IonItem>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <IonItem color="warning" lines="full">
        <IonLabel>
          <h3>Failed to read services</h3>
          <IonNote>{message}</IonNote>
        </IonLabel>
        <div slot="end" className="flex gap-1">
          <IonButton fill="outline" onClick={onRetry}>
            Retry
          </IonButton>
          <IonButton fill="outline" onClick={onRediscover}>
            Rediscover
          </IonButton>
        </div>
      </IonItem>
    );
  }

  if (services.length === 0) {
    return (
      <IonItem lines="full">
        <IonLabel>
          <h3>No services discovered</h3>
          <IonNote>
            The peripheral may still be setting up, or your platform can&apos;t see its services.
          </IonNote>
        </IonLabel>
        <IonButton slot="end" fill="outline" onClick={onRediscover}>
          Rediscover
        </IonButton>
      </IonItem>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-1">
        <IonNote>
          {services.length} service{services.length === 1 ? '' : 's'}
        </IonNote>
        <IonButton fill="clear" size="small" onClick={onRediscover} aria-label="Rediscover">
          <IonIcon slot="icon-only" icon={refreshOutline} />
        </IonButton>
      </div>
      {services.map((svc) => (
        <IonList key={svc.uuid}>
          <IonListHeader>
            <IonLabel>
              <h3>{labelFor(svc.uuid, 'service')}</h3>
              <IonNote>{svc.characteristics.length} characteristic(s)</IonNote>
            </IonLabel>
          </IonListHeader>
          {svc.characteristics.map((ch) => {
            const key = `${svc.uuid}|${ch.uuid}`;
            const notifying = notifyingKeys?.has(key) ?? false;
            return (
              <IonItem key={ch.uuid} button onClick={() => onSelectCharacteristic(svc, ch)}>
                <IonLabel>
                  <h4>{labelFor(ch.uuid, 'characteristic')}</h4>
                  <PropBadges props={ch.properties} />
                </IonLabel>
                {notifying ? <IonBadge color="success">live</IonBadge> : null}
              </IonItem>
            );
          })}
        </IonList>
      ))}
    </>
  );
}
