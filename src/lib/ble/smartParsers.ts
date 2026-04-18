import { dataViewToText } from '@capacitor-community/bluetooth-le';

export type SmartParseResult = { label: string; value: string } | null;

function short(uuid: string): string {
  const lower = uuid.toLowerCase();
  const m = /^0000([0-9a-f]{4})-0000-1000-8000-00805f9b34fb$/.exec(lower);
  return m?.[1] ?? lower;
}

function asDataView(bytes: number[]): DataView {
  return new DataView(Uint8Array.from(bytes).buffer);
}

type Parser = (bytes: number[]) => SmartParseResult;

const parsers: Record<string, Parser> = {
  '2a19': (b) => (b[0] !== undefined ? { label: 'Battery Level', value: `${b[0]}%` } : null),
  '2a37': (b) => {
    if (b.length === 0 || b[0] === undefined) return null;
    const flags = b[0];
    const sixteenBit = (flags & 0x01) !== 0;
    if (sixteenBit) {
      if (b.length < 3 || b[1] === undefined || b[2] === undefined) return null;
      const bpm = b[1] | (b[2] << 8);
      return { label: 'Heart Rate', value: `${bpm} bpm` };
    }
    if (b[1] === undefined) return null;
    return { label: 'Heart Rate', value: `${b[1]} bpm` };
  },
  '2a38': (b) => {
    if (b[0] === undefined) return null;
    const locations = ['Other', 'Chest', 'Wrist', 'Finger', 'Hand', 'Ear Lobe', 'Foot'];
    return { label: 'Body Sensor Location', value: locations[b[0]] ?? `Unknown (${b[0]})` };
  },
  '2a24': (b) => ({ label: 'Model Number', value: dataViewToText(asDataView(b)) }),
  '2a25': (b) => ({ label: 'Serial Number', value: dataViewToText(asDataView(b)) }),
  '2a26': (b) => ({ label: 'Firmware Revision', value: dataViewToText(asDataView(b)) }),
  '2a27': (b) => ({ label: 'Hardware Revision', value: dataViewToText(asDataView(b)) }),
  '2a28': (b) => ({ label: 'Software Revision', value: dataViewToText(asDataView(b)) }),
  '2a29': (b) => ({ label: 'Manufacturer Name', value: dataViewToText(asDataView(b)) }),
  '2a00': (b) => ({ label: 'Device Name', value: dataViewToText(asDataView(b)) }),
  '2a6e': (b) => {
    if (b.length < 2 || b[0] === undefined || b[1] === undefined) return null;
    const raw = b[0] | (b[1] << 8);
    const signed = raw > 0x7fff ? raw - 0x10000 : raw;
    return { label: 'Temperature', value: `${(signed / 100).toFixed(2)} °C` };
  },
  '2a6d': (b) => {
    if (b.length < 4) return null;
    const dv = asDataView(b);
    return { label: 'Pressure', value: `${(dv.getUint32(0, true) / 10).toFixed(1)} Pa` };
  },
  '2a78': (b) => {
    if (b.length < 2 || b[0] === undefined || b[1] === undefined) return null;
    const raw = b[0] | (b[1] << 8);
    return { label: 'Humidity', value: `${(raw / 100).toFixed(2)} %` };
  },
};

export function smartParse(charUuid: string, bytes: number[]): SmartParseResult {
  const parser = parsers[short(charUuid)];
  if (!parser) return null;
  try {
    return parser(bytes);
  } catch {
    return null;
  }
}
