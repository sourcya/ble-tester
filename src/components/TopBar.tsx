import { IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  endButtons?: ReactNode;
  startButtons?: ReactNode;
};

export default function TopBar({ title, startButtons, endButtons }: Props) {
  return (
    <IonHeader>
      <IonToolbar>
        {startButtons ? <IonButtons slot="start">{startButtons}</IonButtons> : null}
        <IonTitle>{title}</IonTitle>
        {endButtons ? <IonButtons slot="end">{endButtons}</IonButtons> : null}
      </IonToolbar>
    </IonHeader>
  );
}
