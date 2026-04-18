import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

type Props = {
  isOpen: boolean;
  deviceLabel: string;
  onCancel: () => void;
};

export default function ConnectingOverlay({ isOpen, deviceLabel, onCancel }: Props) {
  return (
    <IonModal isOpen={isOpen} backdropDismiss={false} className="connecting-overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connecting…</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="flex flex-col items-center gap-4 p-4" style={{ marginTop: '25vh' }}>
          <IonSpinner name="crescent" />
          <div style={{ textAlign: 'center' }}>
            Connecting to <strong>{deviceLabel}</strong>
          </div>
          <IonButton fill="outline" color="medium" onClick={onCancel}>
            Cancel
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
}
