import React from "react";
import { IonCardContent, IonButton, IonIcon } from "@ionic/react";
import { refreshOutline } from "ionicons/icons";

class TopBarC extends React.Component {
  render() {
    return (
      <IonCardContent>
        <IonButton
          disabled={!this.props.isBtEnabled}
          fill="outline"
          onClick={() => this.props.scanBt()}
        >
          Scan
        </IonButton>
        <IonButton onClick={() => this.props.reset()}>
          <IonIcon icon={refreshOutline} />
        </IonButton>
      </IonCardContent>
    );
  }
}
export default TopBarC;
