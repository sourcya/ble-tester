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
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonHeader,
  IonButtons
 } from '@ionic/react';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { bluetoothSharp, refreshOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';

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
            isConnected: false,
            showDataModal: false
        }
        this.isNative = Capacitor.isNativePlatform()
    }

    getBtStatus = async () => {
        try {
          await BleClient.initialize();
          let isBtEnabled = await BleClient.isEnabled()
          this.setState({
            isBtEnabled: isBtEnabled
          })
          if(!this.state.isBtEnabled) {
            this.setState({
              message: "BT not enabled, or not supported!"
            })
          }
        }
        catch(e) {
          this.catchError(e, 'Bluetooth Unavailable')
        }
    }

    scanBt = async () => {
      try {
        this.setState({
          devices: [],
          selectedDevice: {},
          data: [],
          services: [],
          message: "Scanning..."
        })
        await BleClient.initialize();
        let device = await BleClient.requestDevice({
          services: [],
          optionalServices: [],
          namePrefix: ""
        })
        this.setState({
          devices: [device],
        })
        this.connectBt(device)
      } catch(e) {
        this.catchError(e, 'Scan Error')
      }
    }

    scanBtLE = async () => {
        try {
          this.setState({
            devices: [],
            selectedDevice: null,
            data: [],
            services: [],
            loading: true,
            message: "Scanning..."
          })
          await BleClient.initialize();
          await BleClient.requestLEScan(
            {
              services: [],
            },
            (device) => {
              this.setState({
                devices: [...this.state.devices, device]
              })
            }
          );
          setTimeout(async () => {
            await BleClient.stopLEScan();
            this.setState({
              loading: false,
              message: "Scan Finished"
            })
          }, 5000)
        } catch(e) {
          this.catchError(e, 'Scan Error')
        }
    }

    connectBt = async (device) => {
      try {
        this.setState({
          message: "Connecting...",
          services: [],
          loading: true,
          data: [],
          selectedDevice: device
        })
        await BleClient.initialize()
        await BleClient.disconnect(this.state.selectedDevice.deviceId)
        await BleClient.connect(this.state.selectedDevice.deviceId, (id) => console.log(`Device ${id} disconnected!`))
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
      }
      catch (e){
        this.catchError(e, 'Cannot Connect Error')
      }
    }
  
    read = async (deviceId, serviceUUID, chxUUID) => {
      try {
        this.setState({
          message: "Recieving Data...",
          data:[],
          showDataModal: true
        })
        await BleClient.initialize()
        await BleClient.disconnect(deviceId)
        await BleClient.connect(deviceId, (id) => console.log(`Device ${id} disconnected!`))
          let value = await BleClient.read(
            deviceId,
            serviceUUID,
            chxUUID
          )
          let text = {}
          let bin = {}
          for (let i = 0; i < value.byteLength; i++) {
            bin.uint8 += value.getUint8(i)
            text.unit8 += String.fromCharCode(value.getUint16(i))
          }
          this.setState({
            data:
              [{
                serviceUUID: serviceUUID,
                chxUUID: chxUUID,
                bin: bin,
                text: text
              }]
          })    
      }
      catch(e) {
        this.catchError(e, 'Cannot Read Error')
      }
    }

    notify = async (deviceId, serviceUUID, chxUUID, start = true) => {
      try {
        if (!start) {
          await BleClient.stopNotifications(deviceId, serviceUUID, chxUUID)
          return null
        }
        this.setState({
          message: "Recieving Data...",
          data: [],
          showDataModal: true
        })
        await BleClient.initialize()
        await BleClient.disconnect(deviceId)
        await BleClient.connect(deviceId, (id) => console.log(`Device ${id} disconnected!`))
        await BleClient.startNotifications(
          deviceId,
          serviceUUID,
          chxUUID,
          (value) => {
            let text = {}
            let bin = {}
            for (let i = 0; i < value.byteLength; i++) {
              bin.uint8 += value.getUint8(i)
              text.unit8 += String.fromCharCode(value.getUint16(i))
            }
            this.setState({
              data:
                [
                  ...this.state.data,
                  {
                    notification: true,
                    serviceUUID: serviceUUID,
                    chxUUID: chxUUID,
                    bin: bin,
                    text: text
                }]
            })            
          }
        )
      }
      catch(e) {
        this.catchError(e, 'Cannot Read Error')
      }
    }
    
    disconnectBt = async () => {
      try {
          await BleClient.initialize()
          this.setState({
            message: "Disconnected",
            loading: false,
            isConnected: false,
            data: [],
            devices: [],
            selectedDevice: {},
            services: [],
            showDataModal: false
          })
          this.setState({

          })
      }
      catch(e) {
          this.catchError(e, 'Cannot Disconnect Error' )
      }
    }

    catchError(e, message) {
      //throw new Error(e)
        this.setState({
          message: message,
          loading: false,
          devices: [],
          selectedDevice: {},
          services: []
        })
    }

    componentDidMount() {
        this.getBtStatus()
    }
    
    render() {
        return (
          <IonPage>
            <IonLoading
            isOpen={this.state.loading}
            message={'loading...'}
            duration={10000}
            />
            <IonModal 
              isOpen={this.state.showDataModal}
            >
              <IonHeader translucent>
                <IonToolbar>
                  <IonButtons slot="end">
                    {
                      (this.state.data[0] && this.state.data[0].notification) &&
                        <IonButton onclick={ () =>
                          {
                            this.notify(this.state.selectedDevice.deviceId, this.state.data[0].serviceUUID, this.state.data[0].chxUUID, false)
                            this.disconnectBt()
                          }
                        }>Close</IonButton>
                    }
                    {
                      (this.state.data[0] && !this.state.data[0].notification) &&
                        <IonButton onclick={() => this.disconnectBt()}>Close</IonButton>
                    }
                    {
                      !this.state.data[0] &&
                        <IonButton onclick={() => this.disconnectBt()}>Close</IonButton>
                    }
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent fullscreen>
                <IonList>
                  {
                    this.state.data.map((data) => {
                      return (
                        <IonItem>
                          <IonLabel>
                            <h3>{data.serviceUUID}</h3>
                            <h4>{data.chxUUID}</h4>
                            <p>{data.bin}</p>
                            <p>{data.text}</p>
                          </IonLabel>
                        </IonItem>
                      )
                    })
                  }
                </IonList>
              </IonContent>
            </IonModal>
            <IonContent fullscreen>
                <IonCardContent>
                  <IonButton disabled={!this.state.isBtEnabled} fill="outline" onClick={()=>this.scanBt()}>Scan</IonButton>
                  <IonButton disabled={!this.state.isBtEnabled || !this.isNative } fill="outline" onClick={()=>this.scanBtLE()}>Scan LE</IonButton>
                  <IonButton onClick={()=>this.disconnectBt()}><IonIcon icon={refreshOutline} /></IonButton>
                </IonCardContent>
                <IonCard>
                    <IonCardHeader>
                        <IonToolbar>
                            <IonTitle slot="end">{this.state.message}</IonTitle>
                            { this.state.isBtEnabled || this.state.message === 'Error'
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
                                  <IonItem button key={device.deviceId} onClick={ ()=> this.connectBt(device) }>
                                      {
                                        (device.name) ? 
                                        <IonLabel>{device.name}</IonLabel> : 
                                        <IonLabel>{device.deviceId}</IonLabel>
                                      }
                                  </IonItem>
                                )
                              })
                            }
                        </IonList>
                    </IonCardContent>
                </IonCard>
                {
                    this.state.services.map( (service) => {
                        return(                        
                            <IonCard key={service.uuid}>
                                <IonCardHeader>
                                    <IonLabel color='danger' text-wrap>{service.uuid}</IonLabel>
                                </IonCardHeader>
                                <IonCardContent>
                                        { 
                                          service.characteristics.map( (chx) => {
                                            console.log(service)
                                              return (
                                                <IonGrid key={chx.uuid}>
                                                  <IonRow class="ion-justify-content-center">
                                                    <IonCol size="12" size-xs>
                                                      <IonTitle color='primary' size='small' text-wrap>{chx.uuid}</IonTitle>
                                                    </IonCol>
                                                  </IonRow>
                                                  <IonRow class="ion-justify-content-center">
                                                    <IonCol size="12" size-xs>
                                                      <IonButton onClick={() => this.read(this.state.selectedDevice.deviceId, service.uuid, chx.uuid)} size='small' color='dark' disabled={!chx.properties.read}>
                                                        <IonLabel slot='start'>read</IonLabel>
                                                      </IonButton>
                                                    </IonCol>
                                                    <IonCol size="12" size-xs>
                                                      <IonButton onClick={() => this.notify(this.state.selectedDevice.deviceId, service.uuid, chx.uuid)} size='small' color='dark' disabled={!chx.properties.notify}>
                                                        <IonLabel slot='start'>notify</IonLabel>
                                                      </IonButton>
                                                    </IonCol>
                                                    <IonCol size="12" size-xs>
                                                      <IonButton size='small' color='dark' disabled={!chx.properties.write}>
                                                        <IonLabel slot='start'>write</IonLabel>
                                                      </IonButton>
                                                    </IonCol>
                                                  </IonRow>
                                              </IonGrid>

                                              )
                                          })
                                        }
                                  </IonCardContent>
                            </IonCard>
                        )
                    })
                }
            </IonContent>
          </IonPage>
        )
    }
}

export default BleTest;
