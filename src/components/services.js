import React from "react";
import {
  IonCard,
  IonCardContent,
  IonLabel,
  IonCardHeader,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonList
} from "@ionic/react";

class ServicesC extends React.Component {
  render() {
    return (
      <IonList>
      { 
        this.props.services.map((service) => {
          return(
            <IonCard
              button
              onClick={() => this.props.handleServiceSelect(service)}
              key={service.uuid}
            >
              <IonCardHeader>
                <IonLabel color="success" text-wrap>
                  {service.uuid}
                </IonLabel>
              </IonCardHeader>
              <IonCardContent>
                {service.characteristics.map((chx) => {
                  return (
                    <IonGrid key={chx.uuid}>
                      <IonRow class="ion-justify-content-center">
                        <IonCol size="12" size-xs>
                          <IonTitle color="primary" size="small" text-wrap>
                            {chx.uuid}
                          </IonTitle>
                        </IonCol>
                      </IonRow>
                      <IonRow class="ion-justify-content-center">
                        <IonCol size="12" size-xs>
                          <IonLabel
                            color={chx.properties.read ? "primary" : "medium"}
                          >
                            | read | 
                          </IonLabel>
                          <IonLabel
                            color={chx.properties.notify ? "primary" : "medium"}
                          >
                            | notify | 
                          </IonLabel>
                          <IonLabel
                            color={chx.properties.write ? "primary" : "medium"}
                          >
                            | write |
                          </IonLabel>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  );
                })}
              </IonCardContent>
            </IonCard>
          )
        })
      }
      </IonList>
    )

  }
}
export default ServicesC;
