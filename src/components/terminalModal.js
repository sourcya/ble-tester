import React from "react";
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonToolbar,
  IonButton,
  IonModal,
  IonHeader,
  IonButtons,
  IonTitle,
  IonCard,
  IonInput,
} from "@ionic/react";

class TerminalModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showReadFrom: false,
      showNotifyFrom: false,
      showWriteTo: false,
      readChx: null,
      writeChx: null,
      notifyChx: null,
      writeArray: null
    };
  }
  setNotifyChx = (chx) => {
    this.setState({
      notifyChx: chx,
    });
  };
  stopNotifications = () => {
    this.props.handleStopNotify(
      this.props.device.deviceId,
      this.props.service.uuid,
      this.state.notifyChx
    );
    this.setState({
      notifyChx: null,
    });
  };
  selectReadChx = () => {
    const showReadFrom = !this.state.showReadFrom;
    this.setState({
      showReadFrom: showReadFrom,
    });
  };
  selectNotifyChx = () => {
    const showNotifyFrom = !this.state.showNotifyFrom;
    this.setState({
      showNotifyFrom: showNotifyFrom,
    });
  };
  setWriteChx = (chx) => {
    this.setState({
      writeArray : [],
      writeChx: chx,
    });
  };
  setWriteAscii = (value) => {
    let v = []
    v = value.split(" ");
    this.setState({
      writeArray: v
    })
  }
  handleWrite = async () => {
    this.props.handleWrite(
      this.state.writeArray,
      this.props.device.deviceId,
      this.props.service.uuid,
      this.state.writeChx
    )
    this.selectWriteChx()
  }
  selectWriteChx = () => {
    this.setState({
      showWriteTo: !this.state.showWriteTo,
    });
  };
  render() {
    return (
      <IonContent>
        <IonModal isOpen={this.props.show}>
          <IonHeader translucent>
            <IonToolbar>
              <IonButtons slot="end">
                <IonButton
                  onclick={() => {
                    this.props.handleCloseTerminal();
                  }}
                >
                  X
                </IonButton>
              </IonButtons>
              <IonButtons slot="start">
                <IonButton onClick={() => this.selectReadChx()}>Read</IonButton>
                <IonButton onClick={() => this.selectWriteChx()}>
                  Write
                </IonButton>
                {this.state.notifyChx === null && (
                  <IonButton onClick={() => this.selectNotifyChx()}>
                    Notify
                  </IonButton>
                )}
                {this.state.notifyChx !== null && (
                  <IonButton onClick={() => this.stopNotifications()}>
                    Stop Notifications
                  </IonButton>
                )}
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            <IonCard>
              <IonItem>{this.props.device.name}</IonItem>
              <IonItem>
                <IonLabel color="success">{this.props.service.uuid}</IonLabel>
              </IonItem>
            </IonCard>
            <IonList>
              {this.props.data.map((data, i) => {
                return (
                  <IonItem key={i} lines="none">
                    <IonLabel
                      text-wrap
                      color={data.type === "error" ? "danger" : "primary"}
                    >
                      {`${data.type} | ascii >> ${data.ascii} | uint8 >> ${data.bin}`}
                    </IonLabel>
                  </IonItem>
                );
              })}
            </IonList>
          </IonContent>
        </IonModal>
        <IonModal isOpen={this.state.showReadFrom}>
          <IonHeader translucent>
            <IonToolbar>
              <IonTitle color={`primary`}>Read From</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onclick={() => {
                    this.selectReadChx();
                  }}
                >
                  X
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            <IonList>
              {this.props.service.characteristics &&
                this.props.service.characteristics.map((chx, i) => {
                  return (
                    <IonItem
                      key={i}
                      disabled={!chx.properties.read}
                      button
                      onClick={() => {
                        this.props.handleRead(
                          this.props.device.deviceId,
                          this.props.service.uuid,
                          chx.uuid
                        );
                        this.selectReadChx();
                      }}
                    >
                      <IonLabel>{chx.uuid}</IonLabel>
                    </IonItem>
                  );
                })}
            </IonList>
          </IonContent>
        </IonModal>
        <IonModal isOpen={this.state.showNotifyFrom}>
          <IonHeader translucent>
            <IonToolbar>
              <IonTitle color={`primary`}>Notify From</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onclick={() => {
                    this.selectNotifyChx();
                  }}
                >
                  X
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            <IonList>
              {this.props.service.characteristics &&
                this.props.service.characteristics.map((chx, i) => {
                  return (
                    <IonItem
                      key={i}
                      disabled={!chx.properties.notify}
                      button
                      onClick={() => {
                        this.props.handleStartNotify(
                          this.props.device.deviceId,
                          this.props.service.uuid,
                          chx.uuid
                        );
                        this.selectNotifyChx();
                        this.setNotifyChx(chx.uuid);
                      }}
                    >
                      <IonLabel>{chx.uuid}</IonLabel>
                    </IonItem>
                  );
                })}
            </IonList>
          </IonContent>
        </IonModal>
        <IonModal isOpen={this.state.showWriteTo}>
          <IonHeader translucent>
            <IonToolbar>
              <IonTitle color={`primary`}>Write To</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onclick={() => {
                    this.selectWriteChx();
                  }}
                >
                  X
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            {this.state.writeChx && (
              <IonList>
                <IonItem lines='none'>
                  <IonButton
                    size="medium"
                    onClick={()=>this.handleWrite()}
                  >
                    Send
                  </IonButton>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Input</IonLabel>
                  <IonInput
                    placeholder="Enter Input"
                    onIonChange={(e) => this.setWriteAscii(e.detail.value)}
                  ></IonInput>
                </IonItem>
                <IonItem line='none'>
                  <IonLabel text-wrap>Write Hex or ASCII with spaces in between, eg: 0x01 0xA0 H e l l o 0x03</IonLabel>
                </IonItem>
              </IonList>
            )}

            {!this.state.writeChx && (
              <IonList>
                {this.props.service.characteristics &&
                  this.props.service.characteristics.map((chx, i) => {
                    return (
                      <IonItem
                        key={i}
                        disabled={!chx.properties.write}
                        button
                        onClick={() => {
                          this.setWriteChx(chx.uuid);
                        }}
                      >
                        <IonLabel>{chx.uuid}</IonLabel>
                      </IonItem>
                    );
                  })}
              </IonList>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    );
  }
}
export default TerminalModal;
