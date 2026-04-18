/**
 * Subset of Bluetooth SIG Assigned Numbers.
 * Source: https://www.bluetooth.com/specifications/assigned-numbers/
 * Covers the services + characteristics most commonly encountered during testing.
 */

const SERVICES: Record<string, string> = {
  '1800': 'Generic Access',
  '1801': 'Generic Attribute',
  '1802': 'Immediate Alert',
  '1803': 'Link Loss',
  '1804': 'Tx Power',
  '1805': 'Current Time',
  '1808': 'Glucose',
  '1809': 'Health Thermometer',
  '180a': 'Device Information',
  '180d': 'Heart Rate',
  '180e': 'Phone Alert Status',
  '180f': 'Battery',
  '1810': 'Blood Pressure',
  '1811': 'Alert Notification',
  '1812': 'Human Interface Device',
  '1813': 'Scan Parameters',
  '1814': 'Running Speed and Cadence',
  '1816': 'Cycling Speed and Cadence',
  '1818': 'Cycling Power',
  '1819': 'Location and Navigation',
  '181a': 'Environmental Sensing',
  '181b': 'Body Composition',
  '181c': 'User Data',
  '181d': 'Weight Scale',
  '181e': 'Bond Management',
  '181f': 'Continuous Glucose Monitoring',
  '1826': 'Fitness Machine',
  '1827': 'Mesh Provisioning',
  '1828': 'Mesh Proxy',
  '183b': 'Binary Sensor',
  '183c': 'Emergency Configuration',
  fe9a: 'Apple Notification Center Service',
  fff0: 'Common TI SimpleBLE Service',
};

const CHARACTERISTICS: Record<string, string> = {
  '2a00': 'Device Name',
  '2a01': 'Appearance',
  '2a04': 'Peripheral Preferred Connection Parameters',
  '2a05': 'Service Changed',
  '2a19': 'Battery Level',
  '2a1c': 'Temperature Measurement',
  '2a23': 'System ID',
  '2a24': 'Model Number String',
  '2a25': 'Serial Number String',
  '2a26': 'Firmware Revision String',
  '2a27': 'Hardware Revision String',
  '2a28': 'Software Revision String',
  '2a29': 'Manufacturer Name String',
  '2a2b': 'Current Time',
  '2a37': 'Heart Rate Measurement',
  '2a38': 'Body Sensor Location',
  '2a39': 'Heart Rate Control Point',
  '2a50': 'PnP ID',
  '2a6d': 'Pressure',
  '2a6e': 'Temperature',
  '2a76': 'UV Index',
  '2a77': 'Irradiance',
  '2a78': 'Humidity',
};

const DESCRIPTORS: Record<string, string> = {
  '2900': 'Characteristic Extended Properties',
  '2901': 'Characteristic User Description',
  '2902': 'Client Characteristic Configuration',
  '2903': 'Server Characteristic Configuration',
  '2904': 'Characteristic Presentation Format',
};

function short(uuid: string): string {
  const lower = uuid.toLowerCase();
  const m = /^0000([0-9a-f]{4})-0000-1000-8000-00805f9b34fb$/.exec(lower);
  return m?.[1] ?? lower;
}

export function lookupService(uuid: string): string | undefined {
  return SERVICES[short(uuid)];
}
export function lookupCharacteristic(uuid: string): string | undefined {
  return CHARACTERISTICS[short(uuid)];
}
export function lookupDescriptor(uuid: string): string | undefined {
  return DESCRIPTORS[short(uuid)];
}

export function labelFor(uuid: string, kind: 'service' | 'characteristic' | 'descriptor'): string {
  const resolver =
    kind === 'service'
      ? lookupService
      : kind === 'characteristic'
        ? lookupCharacteristic
        : lookupDescriptor;
  const name = resolver(uuid);
  return name ? `${name} (${short(uuid)})` : uuid;
}
