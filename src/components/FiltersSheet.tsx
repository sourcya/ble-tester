import type { Filters, ScanMode } from '@/schemas/ble';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useState } from 'react';

type Props = {
  isOpen: boolean;
  filters: Filters;
  onClose: () => void;
  onSave: (filters: Filters) => void;
};

export default function FiltersSheet({ isOpen, filters, onClose, onSave }: Props) {
  const [local, setLocal] = useState<Filters>(filters);

  const save = () => {
    onSave(local);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scan filters</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonInput
              label="Name prefix"
              labelPlacement="stacked"
              value={local.namePrefix ?? ''}
              onIonInput={(e) =>
                setLocal((s) => ({ ...s, namePrefix: (e.detail.value ?? '') || undefined }))
              }
              placeholder="e.g. Polar"
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Exact name"
              labelPlacement="stacked"
              value={local.name ?? ''}
              onIonInput={(e) =>
                setLocal((s) => ({ ...s, name: (e.detail.value ?? '') || undefined }))
              }
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Services (comma-separated UUIDs)"
              labelPlacement="stacked"
              value={(local.services ?? []).join(',')}
              onIonInput={(e) => {
                const val = (e.detail.value ?? '')
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setLocal((s) => ({ ...s, services: val.length ? val : undefined }));
              }}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Optional services (comma-separated)"
              labelPlacement="stacked"
              value={(local.optionalServices ?? []).join(',')}
              onIonInput={(e) => {
                const val = (e.detail.value ?? '')
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setLocal((s) => ({ ...s, optionalServices: val.length ? val : undefined }));
              }}
            />
          </IonItem>
          <IonItem>
            <IonSelect
              label="Scan mode"
              labelPlacement="stacked"
              value={local.scanMode}
              onIonChange={(e) => setLocal((s) => ({ ...s, scanMode: e.detail.value as ScanMode }))}
            >
              <IonSelectOption value={0}>Low power</IonSelectOption>
              <IonSelectOption value={1}>Balanced</IonSelectOption>
              <IonSelectOption value={2}>Low latency</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonCheckbox
              checked={local.allowDuplicates}
              onIonChange={(e) => setLocal((s) => ({ ...s, allowDuplicates: e.detail.checked }))}
            >
              <IonLabel>Allow duplicate advertisements</IonLabel>
            </IonCheckbox>
          </IonItem>
        </IonList>
        <div className="p-4">
          <IonButton expand="block" onClick={save}>
            Save filters
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
}
