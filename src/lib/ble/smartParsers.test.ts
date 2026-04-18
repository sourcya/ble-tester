import { describe, expect, it } from 'vitest';
import { smartParse } from './smartParsers';

const BATTERY = '00002a19-0000-1000-8000-00805f9b34fb';
const HR = '00002a37-0000-1000-8000-00805f9b34fb';

describe('smartParse', () => {
  it('decodes battery level', () => {
    expect(smartParse(BATTERY, [80])).toEqual({ label: 'Battery Level', value: '80%' });
  });

  it('decodes 8-bit heart rate', () => {
    expect(smartParse(HR, [0x00, 72])).toEqual({ label: 'Heart Rate', value: '72 bpm' });
  });

  it('decodes 16-bit heart rate', () => {
    expect(smartParse(HR, [0x01, 0xa0, 0x01])).toEqual({
      label: 'Heart Rate',
      value: '416 bpm',
    });
  });

  it('returns null for unknown characteristic', () => {
    expect(smartParse('12345678-1234-1234-1234-123456789012', [1])).toBeNull();
  });
});
