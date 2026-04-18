import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.sourcya.ble.tester.app',
  appName: 'BLE Tester',
  webDir: 'build',
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: 'Scanning…',
        cancel: 'Cancel',
        availableDevices: 'Available devices',
        noDeviceFound: 'No device found',
      },
    },
  },
};

export default config;
