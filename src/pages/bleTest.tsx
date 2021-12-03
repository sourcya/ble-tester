import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { BleClient, BleDevice } from "@capacitor-community/bluetooth-le";
import { Capacitor } from "@capacitor/core";
import { Loading, Terminal, TopBar, Devices, Services } from "../components";



const BleTest: React.FC = () => {

  const isNative = Capacitor.isNativePlatform();
  const [ optionalService, setOptionalService ] = useState("");
  const [ prefixFilter, setPrefixFilter ] = useState("");
  const [ devices, setDevices ] = useState({});
  const [ services, setServices ] = useState({});
  const [ selectedDevice, setSelectedDevice ] = useState<any>({});
  const [ selectedService, setSelectedService ] = useState({});
  const [ message, setMessage ] = useState("idle");
  const [ isBtEnabled, setIsBtEnabled ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ isConnected, setIsConnected ] = useState(false);
  const [ showTerminal, setShowTerminal ] = useState(false);
  const [ data, setData ] = useState<DataType[]>([]); //{type: read/write/notify/error, bin: 8 int binary, ascii: ASCII Value}
  const [ connectBT, setConnectBt] = useState({});

  useEffect(() => {
    // code to run on component mount
    const prefixFilter = localStorage.getItem("prefix")
    const optionalService = localStorage.getItem("optionalService")
    if (prefixFilter) {
      setPrefixFilter(prefixFilter);
    }
    if (optionalService) {
      setOptionalService(optionalService);
    }
    getBtStatus();
  }, [])

  interface DataType{
    chx: any,
    bin: string,
    type: string,
    ascii: string
  }

  const getBtStatus = async () => {
    try {
      await BleClient.initialize();
      let isBtEnabled = await BleClient.isEnabled();
      setIsBtEnabled(isBtEnabled);
      if (!isBtEnabled) {
          setMessage("BT not enabled, or not supported!");
      }
    } catch (e) {
      catchError(e, "Bluetooth Unavailable");
    }
  };

  const scanBt = async () => {
    try {

      setDevices([]);
      setSelectedDevice({});
      setData([]);
      setServices([]);
      setMessage("Scanning...");

      await BleClient.initialize();
      let device = await BleClient.requestDevice({
        services: [],
        optionalServices: optionalService ? [optionalService] : [],
        namePrefix: prefixFilter ? prefixFilter : '',
      });

      setDevices([device]);
      setConnectBt(device);

    } catch (e) {
      catchError(e, "Scan Error");
    }
  };

  const connectBt = async (device:any) => {
    try {
      setMessage("Connecting...");
      setServices([]);
      setLoading(true);
      setData([]);
      setSelectedDevice(device);
      await BleClient.initialize();
      await BleClient.disconnect(selectedDevice.deviceId);
      await BleClient.connect(selectedDevice.deviceId, (id) =>
        console.log(`Device ${id} disconnected!`)
      );
      await BleClient.getServices(selectedDevice.deviceId).then(
        (services) => {
          if (services[0]) {
            setMessage("Connected");
            setServices(services);
            setLoading(false);
            setIsConnected(true);
          } else {
            setMessage("No Services Found");
            setLoading(false);
            setIsConnected(false);
          }
        }
      );
    } catch (e) {
      catchError(e, "Cannot Connect Error");
    }
  };

  const selectService = async (service:string) => {
    try {
      setData([]);
      setSelectedService(service);
      setShowTerminal(true);
    } catch (e) {
      catchError(e, "Select Service Error");
    }
  };

  const closeTerminal = async () => {
    try {
      setLoading(false);
      setShowTerminal(false);
    } catch (e) {
      catchError(e, "Error");
    }
  };

  const reset = async () => {
    try {
      await BleClient.initialize();
      setMessage("Disconnected");
      setLoading(false);
      setIsConnected(false);
      setData([]);
      setDevices([]);
      setSelectedDevice({});
      setServices([]);

      const prefixFilter = localStorage.getItem("prefix")
      const optionalService = localStorage.getItem("optionalService")
      if (prefixFilter) {
        setPrefixFilter(prefixFilter);
      }
      if (optionalService) {
        setOptionalService(optionalService);
      }
      getBtStatus();
    } catch (e) {
      catchError(e, "Cannot Disconnect Error");
    }
  };

  const parse = (chx:unknown, type:string, value:any) => {
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
    setData([
      ...data,
      {
        chx: chx,
        type: type,
        bin: bin,
        ascii: ascii,
      }
    ]);
  };

  const read = async (deviceId:any, serviceUUID:any, chxUUID:any) => {
    try {
      await BleClient.initialize();
      await BleClient.disconnect(selectedDevice.deviceId);
      await BleClient.connect(selectedDevice.deviceId, (id) =>
        console.log(`Device ${id} disconnected!`)
      );
      let value = await BleClient.read(deviceId, serviceUUID, chxUUID);
      parse(chxUUID, "read", value);
    } catch (e) {
      setData([
        ...data,
        {
          chx: chxUUID,
          type: "error",
          bin: "0x0",
          ascii: "Error on Read from Device",
        }
      ]);
    }
  };

  const notify = async (deviceId:any, serviceUUID:any, chxUUID:any, stop = false) => {
    try {
      if (stop) {
        await BleClient.initialize();
        await BleClient.disconnect(selectedDevice.deviceId);
        await BleClient.connect(selectedDevice.deviceId, (id) =>
          console.log(`Device ${id} disconnected!`)
        );
        await BleClient.stopNotifications(deviceId, serviceUUID, chxUUID);
        setData([
          ...data,
          {
            chx: chxUUID,
            type: "notify",
            bin: "0x0",
            ascii: "Stopped Notifications",
          }
        ]);
        return null;
      }
      await BleClient.initialize();
      await BleClient.disconnect(selectedDevice.deviceId);
      await BleClient.connect(selectedDevice.deviceId, (id) =>
        console.log(`Device ${id} disconnected!`)
      );
      await BleClient.stopNotifications(deviceId, serviceUUID, chxUUID);
      setData([
        ...data,
        {
          chx: chxUUID,
          type: "notify",
          bin: "0x0",
          ascii: "Started Notifications",
        }
      ]);
      await BleClient.startNotifications(
        deviceId,
        serviceUUID,
        chxUUID,
        (value) => {
          parse(chxUUID, "notify", value);
        }
      );
    } catch (e) {
      setData([
        ...data,
        {
          chx: chxUUID,
          type: "error",
          bin: "0x0",
          ascii: "Error on Notify from Device",
        }
      ]);
    }
  };

  const write = async (toWrtieArray = [], deviceId:any, serviceUUID:any, chxUUID:any) => {
    try {
      let buffer = new ArrayBuffer(toWrtieArray.length);
      let view = new DataView(buffer, 0);
      for (let i = 0; i < toWrtieArray.length; i++) {
        let v
        if ( typeof toWrtieArray[i] === 'string' && (toWrtieArray[i] as string).charAt(1) === 'x' ) {
          let hexString = toWrtieArray[i]
          let hex = (hexString as string).replace(/^0x/, '');
          v = hex.match(/[\dA-F]{2}/gi);
        }
        else if ( typeof toWrtieArray[i] === 'number' ) {
          v = toWrtieArray[i]
        }
        else {
          v = new TextEncoder().encode(toWrtieArray[i])
        }

        view.setUint8(i,(v as any))
      }
      parse(chxUUID, "write", view);
      await BleClient.initialize();
      await BleClient.disconnect(selectedDevice.deviceId);
      await BleClient.connect(selectedDevice.deviceId, (id) =>
        console.log(`Device ${id} disconnected!`)
      );
      await BleClient.write(deviceId, serviceUUID, chxUUID, view);
    } catch (e) {
      setData([
        ...data,
        {
          chx: chxUUID,
          type: "error",
          bin: "0x0",
          ascii: "Cannot Write to Device",
        }
      ]);
    }
  };

  const catchError = (e:any, message:string) => {
    //throw new Error(e)
    setMessage(message);
    setLoading(false);
    console.error(e);
  };

  return(
    //this is some placeholder content
    <IonPage>
        <IonContent fullscreen>
          <TopBar
            isBtEnabled={isBtEnabled}
            scanBt={() => scanBt()}
            reset={() => reset()}
          />
          <Devices
            isNative={isNative}
            message={message}
            isBtEnabled={isBtEnabled}
            devices={devices}
            connectBt={(device:any) => connectBt(device)}
          />
          <Services
            services={services}
            handleServiceSelect={(service:string) => selectService(service)}
          />
        <Loading loading={loading} />
        <Terminal
          device={selectedDevice}
          service={selectedService}
          show={showTerminal}
          data={data}
          handleCloseTerminal={() => closeTerminal()}
          handleWrite={(ascii:any, deviceId:any, serviceUUID:any, chxUUID:any) =>
            write(ascii, deviceId, serviceUUID, chxUUID)
          }
          handleRead={(deviceId:any, serviceUUID:any, chxUUID:any) =>
            read(deviceId, serviceUUID, chxUUID)
          }
          handleStartNotify={(deviceId:any, serviceUUID:any, chxUUID:any) =>
            notify(deviceId, serviceUUID, chxUUID)
          }
          handleStopNotify={(deviceId:any, serviceUUID:any, chxUUID:any) =>
            notify(deviceId, serviceUUID, chxUUID, true)
          }
        />
        </IonContent>
      </IonPage>
  );
}

export default BleTest;
