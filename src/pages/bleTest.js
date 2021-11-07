import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import { BleClient } from "@capacitor-community/bluetooth-le";
import { Capacitor } from "@capacitor/core";
import { Loading, Terminal, TopBar, Devices, Services } from "../components";

class BleTest extends React.Component {
  constructor(props) {
    super(props);
    this.isNative = Capacitor.isNativePlatform();
    this.state = {
      optionalService: '',
      prefixFilter: '',
      devices: [],
      services: [],
      selectedDevice: {},
      selectedService: {},
      message: "Idle",
      isBtEnabled: false,
      loading: false,
      isConnected: false,
      showTerminal: false,
      data: [], //{type: read/write/notify/error, bin: 8 int binary, ascii: ASCII Value}
    };
  }
  getBtStatus = async () => {
    try {
      await BleClient.initialize();
      let isBtEnabled = await BleClient.isEnabled();
      this.setState({
        isBtEnabled: isBtEnabled,
      });
      if (!this.state.isBtEnabled) {
        this.setState({
          message: "BT not enabled, or not supported!",
        });
      }
    } catch (e) {
      this.catchError(e, "Bluetooth Unavailable");
    }
  };
  scanBt = async () => {
    try {
      this.setState({
        devices: [],
        selectedDevice: {},
        data: [],
        services: [],
        message: "Scanning...",
      });
      await BleClient.initialize();
      let device = await BleClient.requestDevice({
        services: [],
        optionalServices: this.state.optionalService? [this.state.optionalService] : [],
        namePrefix: this.state.prefixFilter ? this.state.prefixFilter : '',
      });
      this.setState({
        devices: [device],
      });
      this.connectBt(device);
    } catch (e) {
      this.catchError(e, "Scan Error");
    }
  };
  connectBt = async (device) => {
    try {
      this.setState({
        message: "Connecting...",
        services: [],
        loading: true,
        data: [],
        selectedDevice: device,
      });
      await BleClient.initialize();
      await BleClient.disconnect(this.state.selectedDevice.deviceId);
      await BleClient.connect(this.state.selectedDevice.deviceId, (id) =>
        console.log(`Device ${id} disconnected!`)
      );
      await BleClient.getServices(this.state.selectedDevice.deviceId).then(
        (services) => {
          if (services[0]) {
            this.setState({
              message: "Connected",
              services: services,
              loading: false,
              isConnected: true,
            });
          } else {
            this.setState({
              message: "No Services Found",
              loading: false,
              isConnected: false,
            });
          }
        }
      );
    } catch (e) {
      this.catchError(e, "Cannot Connect Error");
    }
  };
  selectService = async (service) => {
    try {
      this.setState({
        data: [],
        selectedService: service,
        showTerminal: true,
      });
    } catch (e) {
      this.catchError(e, "Select Service Error");
    }
  };
  closeTerminal = async () => {
    try {
      this.setState({
        loading: false,
        showTerminal: false,
      });
    } catch (e) {
      this.catchError(e, "Error");
    }
  };
  reset = async () => {
    try {
      await BleClient.initialize();
      this.setState({
        message: "Disconnected",
        loading: false,
        isConnected: false,
        data: [],
        devices: [],
        selectedDevice: {},
        services: [],
      });
      const prefixFilter = localStorage.getItem("prefix")
      const optionalService = localStorage.getItem("optionalService")
      if (prefixFilter) {
        this.setState({
          prefixFilter: prefixFilter
        })
      }
      if (optionalService) {
        this.setState({
          optionalService: optionalService
        })
      }
      this.getBtStatus();
    } catch (e) {
      this.catchError(e, "Cannot Disconnect Error");
    }
  };
  parse = (chx, type, value) => {
    let ascii = '', bin = ''
    for (let i = 0; i < value.byteLength; i++) {
      bin += `${value.getUint8(i)} `;
      const asciiF = () => {
        let v;
        switch (value.getUint8(i)) {
          case 0xa0:
            v = "+ ";
            break;
          case 0x00:
            v = "<NUL> ";
            break;
          case 0x01:
            v = "<SOH> ";
            break;
          case 0x02:
            v = "<STX> ";
            break;
          case 0x03:
            v = "<ETX> ";
            break;
          case 0x04:
            v = "<EOT> ";
            break;
          case 0x05:
            v = "<ENQ> ";
            break;
          case 0x06:
            v = "<ACK> ";
            break;
          case 0x07:
            v = "<BEL> ";
            break;
          case 0x08:
            v = "<BS> ";
            break;
          case 0x09:
            v = "<HT> ";
            break;
          case 0x0a:
            v = "<LF/NL> ";
            break;
          case 0x0b:
            v = "<VT> ";
            break;
          case 0x0c:
            v = "<FF> ";
            break;
          case 0x0d:
            v = "<CR> ";
            break;
          case 0x0e:
            v = "<SO> ";
            break;
          case 0x0f:
            v = "<SI> ";
            break;
          case 0x10:
            v = "<DLE> ";
            break;
          case 0x11:
            v = "<DC1> ";
            break;
          case 0x12:
            v = "<DC2> ";
            break;
          case 0x13:
            v = "<DC3> ";
            break;
          case 0x14:
            v = "<DC4> ";
            break;
          case 0x15:
            v = "<NAK> ";
            break;
          case 0x16:
            v = "<SYN> ";
            break;
          case 0x17:
            v = "<ETB> ";
            break;
          case 0x18:
            v = "<CAN> ";
            break;
          case 0x19:
            v = "<EM> ";
            break;
          case 0x1a:
            v = "<SUB> ";
            break;
          case 0x1b:
            v = "<ESC> ";
            break;
          case 0x1c:
            v = "<FS> ";
            break;
          case 0x1d:
            v = "<GS> ";
            break;
          case 0x1e:
            v = "<RS> ";
            break;
          case 0x1f:
            v = "<US> ";
            break;
          default:
            v = `${String.fromCharCode(value.getUint8(i))} `;
            break;
        }
        return v;
      };
      ascii += asciiF();
    }
    this.setState({
      data: [
        ...this.state.data,
        {
          chx: chx,
          type: type,
          bin: bin,
          ascii: ascii,
        },
      ],
    });
  };
  read = async (deviceId, serviceUUID, chxUUID) => {
    try {
      await BleClient.initialize();
      await BleClient.disconnect(this.state.selectedDevice.deviceId);
      await BleClient.connect(this.state.selectedDevice.deviceId, (id) =>
        console.log(`Device ${id} disconnected!`)
      );
      let value = await BleClient.read(deviceId, serviceUUID, chxUUID);
      this.parse(chxUUID, "read", value);
    } catch (e) {
      this.setState({
        data: [
          ...this.state.data,
          {
            chx: chxUUID,
            type: "error",
            bin: "0x0",
            ascii: "Error on Read from Device",
          },
        ],
      });
    }
  };
  notify = async (deviceId, serviceUUID, chxUUID, stop = false) => {
    try {
      if (stop) {
        await BleClient.initialize();
        await BleClient.disconnect(this.state.selectedDevice.deviceId);
        await BleClient.connect(this.state.selectedDevice.deviceId, (id) =>
          console.log(`Device ${id} disconnected!`)
        );
        await BleClient.stopNotifications(deviceId, serviceUUID, chxUUID);
        this.setState({
          data: [
            ...this.state.data,
            {
              chx: chxUUID,
              type: "notify",
              bin: "0x0",
              ascii: "Stopped Notifications",
            },
          ],
        });
        return null;
      }
      await BleClient.initialize();
      await BleClient.disconnect(this.state.selectedDevice.deviceId);
      await BleClient.connect(this.state.selectedDevice.deviceId, (id) =>
        console.log(`Device ${id} disconnected!`)
      );
      await BleClient.stopNotifications(deviceId, serviceUUID, chxUUID);
      this.setState({
        data: [
          ...this.state.data,
          {
            chx: chxUUID,
            type: "notify",
            bin: "0x0",
            ascii: "Started Notifications",
          },
        ],
      });
      await BleClient.startNotifications(
        deviceId,
        serviceUUID,
        chxUUID,
        (value) => {
          this.parse(chxUUID, "notify", value);
        }
      );
    } catch (e) {
      this.setState({
        data: [
          ...this.state.data,
          {
            chx: chxUUID,
            type: "error",
            bin: "0x0",
            ascii: "Error on Notify from Device",
          },
        ],
      });
    }
  };
  write = async (toWrtieArray = [], deviceId, serviceUUID, chxUUID) => {
    try {
      let buffer = new ArrayBuffer(toWrtieArray.length);
      let view = new DataView(buffer, 0);
      for (let i = 0; i < toWrtieArray.length; i++) {
        let v
        if ( typeof toWrtieArray[i] === 'string' && toWrtieArray[i].charAt(1) === 'x' ) {
          let hexString = toWrtieArray[i]
          let hex = hexString.replace(/^0x/, '');
          v = hex.match(/[\dA-F]{2}/gi);
        }
        else if ( typeof toWrtieArray[i] === 'number' ) {
          v = toWrtieArray[i]
        }
        else {
          v = new TextEncoder().encode(toWrtieArray[i])
        }
        view.setUint8(i,v)
      }
      this.parse(chxUUID, "write", view);
      await BleClient.initialize();
      await BleClient.disconnect(this.state.selectedDevice.deviceId);
      await BleClient.connect(this.state.selectedDevice.deviceId, (id) =>
        console.log(`Device ${id} disconnected!`)
      );
      await BleClient.write(deviceId, serviceUUID, chxUUID, view);
    } catch (e) {
      this.setState({
        data: [
          ...this.state.data,
          {
            chx: chxUUID,
            type: "error",
            bin: "0x0",
            ascii: "Cannot Write to Device",
          },
        ],
      });
    }
  };
  catchError = (e, message) => {
    //throw new Error(e)
    this.setState({
      message: message,
      loading: false,
    });
    console.error(e);
  };
  componentDidMount() {
    const prefixFilter = localStorage.getItem("prefix")
    const optionalService = localStorage.getItem("optionalService")
    if (prefixFilter) {
      this.setState({
        prefixFilter: prefixFilter
      })
    }
    if (optionalService) {
      this.setState({
        optionalService: optionalService
      })
    }
    this.getBtStatus();
  }
  render() {
    return (
      <IonPage>
        <IonContent fullscreen>
          <TopBar
            isBtEnabled={this.state.isBtEnabled}
            scanBt={() => this.scanBt()}
            reset={() => this.reset()}
          />
          <Devices
            isNative={this.isNative}
            message={this.state.message}
            isBtEnabled={this.state.isBtEnabled}
            devices={this.state.devices}
            connectBt={(device) => this.connectBt(device)}
          />
          <Services
            services={this.state.services}
            handleServiceSelect={(service) => this.selectService(service)}
          />
        <Loading loading={this.state.loading} />
        <Terminal
          device={this.state.selectedDevice}
          service={this.state.selectedService}
          show={this.state.showTerminal}
          data={this.state.data}
          handleCloseTerminal={() => this.closeTerminal()}
          handleWrite={(ascii, deviceId, serviceUUID, chxUUID) =>
            this.write(ascii, deviceId, serviceUUID, chxUUID)
          }
          handleRead={(deviceId, serviceUUID, chxUUID) =>
            this.read(deviceId, serviceUUID, chxUUID)
          }
          handleStartNotify={(deviceId, serviceUUID, chxUUID) =>
            this.notify(deviceId, serviceUUID, chxUUID)
          }
          handleStopNotify={(deviceId, serviceUUID, chxUUID) =>
            this.notify(deviceId, serviceUUID, chxUUID, true)
          }
        />
        </IonContent>
      </IonPage>
    );
  }
}
export default BleTest;
