import React from 'react';
import { 
  IonIcon,
  IonContent,
  IonPage,
  IonLoading,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonCardHeader,
  IonToolbar,
  IonButton,
  IonTitle
 } from '@ionic/react';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { bluetoothSharp } from 'ionicons/icons';

class BleTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      services: [],
      selectedDevice: {},
      data: [],
      message: 'Idle',
      isBtEnabled: false,
      loading: false,
      isConnected: false
    }
    this.isNative = Capacitor.isNativePlatform()
    
  }
  componentDidMount() {
    this.getBtStatus()
  }
  getBtStatus = async () => {
    try {
      await BleClient.initialize();
      let isBtEnabled = await BleClient.isEnabled()
      this.setState({
        isBtEnabled: isBtEnabled
      })
      if(!this.state.isBtEnabled && this.isNative) {
        this.setState({
          message: "Bluetooth is not enabled!"
        })
      }
    }
    catch {
      this.catchError()
    }
  }
  scanBt = async () => {
    try {
      this.setState({
        devices: [],
        selectedDevice: null,
        data: [],
        message: "Scanning..."
      })
      await BleClient.initialize();
      let device = await BleClient.requestDevice({
        services: [],
        namePrefix: ""
      })
      console.log(device)
      this.setState({
        devices: [device],
        selectedDevice: device,
        message: "Scan Finished"
      })
    } catch {
      this.catchError()
    }
  }
  
  connectBt = async () => {
    try {
      this.setState({
        message: "Connecting...",
        loading: true,
        data: []
      })
      await BleClient.initialize()
      await BleClient.disconnect(this.state.selectedDevice.deviceId)
      await BleClient.connect(this.state.selectedDevice.deviceId)
      await BleClient.getServices(this.state.selectedDevice.deviceId)
        .then(
          (services) => {
            if(services[0]) {
              this.setState({
                services: services,
                message: "Connected",
                loading: false,
                isConnected: true,
                data: []
              })
            }
          }
        )
      this.state.services ? console.log(this.state.services) : console.log('No Services Found')
      this.recieveFromBt()
    }
    catch {
      this.catchError()
    }
  }

  disconnectBt = async () => {
    try {
      this.setState({
        message: "Disconnecting...",
        loading: true
      })
      await BleClient.disconnect(this.state.selectedDevice.deviceId)
      this.setState({
        message: "Disconnected",
        loading: false,
        isConnected: false
      })
    }
    catch {
      this.catchError()
    }
  }

  recieveFromBt = async () => {
    try {
      this.setState({
        message: "Recieving Data...",
      })
      for (let i = 0; i < this.state.services.length; i++) {
        for (let j = 0; j < this.state.services[i].characteristics.length; j++) {
          if (this.state.services[i].characteristics[j].properties.read) {
            let value = await BleClient.read(
              this.state.selectedDevice.deviceId,
              this.state.services[i].uuid,
              this.state.services[i].characteristics[j].uuid
            )
            console.log(`${value.byteLength} bytes from >> serv: ${this.state.services[i].uuid} | charx: ${this.state.services[i].characteristics[j].uuid}`);
            this.parse(this.state.services[i].uuid, this.state.services[i].characteristics[j].uuid, value)
          } else {
            this.setState({
              data: [
                ...this.state.data,
                {
                  service: this.state.services[i].uuid,
                  chx: this.state.services[i].characteristics[j].uuid,
                  bin: "Reading is not available"
                }
              ]
            })
          }
        }       
      }
      this.disconnectBt()
    }
    catch {
      this.catchError()
    }
  }

  parse(service, chx, data) {
    if (data instanceof DataView) {
        let bin = ''
        for (let i = 0; i < data.byteLength; i++) {
          bin += `${String.fromCharCode(data.getUint8(i))}`     
        }
        this.setState({
          data: [
            ...this.state.data,
            {
              service: service,
              chx: chx,
              bin: bin
            }
          ]
        })
      }
  }
  
  catchError() {
    this.setState({
      message: "Error",
      loading: false,
    })
  }

  render() {
    return (
      <IonPage>
        <IonLoading
          isOpen={this.state.loading}
          message={'loading...'}
          duration={10000}
        />
        <IonContent fullscreen>
          <IonCardContent>
            <IonButton disabled={!this.state.isBtEnabled} fill="outline" onClick={()=>this.scanBt()}>Scan</IonButton>
            <IonButton disabled={!this.state.isConnected} onClick={()=>this.disconnectBt()}>Disconnect</IonButton>
          </IonCardContent>
          <IonCard>
            <IonCardHeader>
              <IonToolbar>
                <IonTitle slot="end">{this.state.message}</IonTitle>
                { this.state.isBtEnabled
                  ? <IonIcon slot="end" color="warning" icon={bluetoothSharp}/>
                  : <IonIcon slot="end" color="danger" icon={bluetoothSharp}/>
                }
              </IonToolbar>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {
                  this.state.devices.map( (device) => {
                    return(
                      <IonItem key={device.deviceId}>
                        {(device.name) ? <IonLabel>{device.name}</IonLabel> : <IonLabel>"UNKNOWN"</IonLabel>}
                        <IonButton slot='end' color='primary' onClick={ ()=> this.connectBt() }>Read</IonButton>
                      </IonItem>
                    )
                  })
                }
              </IonList>
              {this.state.data.map(
                (data) => {
                  return (
                    <IonCard>
                      <IonItem lines='none'>
                        <IonLabel color='tertiary' text-wrap>{`SERVICE >> ${data.service}`}</IonLabel>
                      </IonItem>
                      <IonItem lines='none'>
                        <IonLabel color='danger' text-wrap>{`CHX >> ${data.chx}`}</IonLabel>
                      </IonItem>
                      <IonItem>
                        <IonLabel color='dark' text-wrap>{`MSG >> ${data.bin}`}</IonLabel>
                      </IonItem>
                    </IonCard>
                  )
                }
              )}
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    )
  };
};

export default BleTest;
