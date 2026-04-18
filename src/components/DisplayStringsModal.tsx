import type { DisplayStrings } from '@/schemas/ble';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';

type Props = {
  isOpen: boolean;
  displayStrings: DisplayStrings;
  onClose: () => void;
  onSave: (value: DisplayStrings) => void;
};

export default function DisplayStringsModal({ isOpen, displayStrings, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<DisplayStrings>(displayStrings);

  useEffect(() => {
    if (isOpen) setDraft(displayStrings);
  }, [isOpen, displayStrings]);

  const save = () => {
    onSave(draft);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Picker dialog labels</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {(['scanning', 'cancel', 'availableDevices', 'noDeviceFound'] as const).map((key) => (
            <IonItem key={key}>
              <IonInput
                label={key}
                labelPlacement="stacked"
                value={draft[key]}
                onIonInput={(e) => setDraft({ ...draft, [key]: e.detail.value ?? '' })}
              />
            </IonItem>
          ))}
          <IonItem lines="none">
            <IonNote>Strings shown in the native Bluetooth picker dialog.</IonNote>
          </IonItem>
        </IonList>
        <div className="p-4">
          <IonButton expand="block" onClick={save}>
            Save
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
}
