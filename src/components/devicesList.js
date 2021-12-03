import React from "react";
import {
    IonIcon,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    IonCardHeader,
    IonToolbar,
    IonTitle,
} from "@ionic/react";
import { bluetoothSharp } from "ionicons/icons";

class DevicesList extends React.Component {
  render() {
    //console.log("DEVICES CONTENT: " + this.props.devices);
    return (
      <IonCard>
        <IonCardHeader>
          <IonToolbar>
            <IonTitle slot="end">{this.props.message}</IonTitle>
            {this.props.isBtEnabled || this.props.message === "Error" ? (
              <IonIcon slot="end" color="warning" icon={bluetoothSharp} />
            ) : (
              <IonIcon slot="end" color="danger" icon={bluetoothSharp} />
            )}
          </IonToolbar>
          {
            !this.props.isNative && (
            <IonLabel color="danger">
              Web Bluetooth is experimental on this platform.
              <a
                rel="noreferrer"
                target="_blank"
                href="https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md"
              >
                See here
              </a>
            </IonLabel>
            )
          }
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {this.props.devices.map && this.props.devices.map((device) => {
              return (
                <IonItem
                  button
                  key={device.deviceId}
                  onClick={() => this.props.connectBt(device)}
                >
                  {device.name ? (
                    <IonLabel>{device.name}</IonLabel>
                  ) : (
                    <IonLabel>{device.deviceId}</IonLabel>
                  )}
                </IonItem>
              );
            })}
          </IonList>
        </IonCardContent>
      </IonCard>
    );
  }
}
export default DevicesList;
