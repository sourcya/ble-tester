import type { RecentDevice } from '@/schemas/ble';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

type Props = {
  isOpen: boolean;
  recents: RecentDevice[];
  onClose: () => void;
  onClearAll: () => void;
};

export default function RecentDevicesModal({ isOpen, recents, onClose, onClearAll }: Props) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Recent devices ({recents.length})</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {recents.length === 0 ? (
          <IonItem lines="none">
            <IonLabel color="medium">No recent devices yet.</IonLabel>
          </IonItem>
        ) : (
          <IonList>
            {recents.map((r) => (
              <IonItem key={r.deviceId}>
                <IonLabel>
                  <h3>{r.nickname || '(unnamed)'}</h3>
                  <IonNote>
                    {r.deviceId}
                    <br />
                    {new Date(r.lastSeen).toLocaleString()}
                  </IonNote>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
        <div className="p-4">
          <IonButton
            expand="block"
            fill="outline"
            color="danger"
            disabled={recents.length === 0}
            onClick={() => {
              onClearAll();
              onClose();
            }}
          >
            Clear all
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
}
