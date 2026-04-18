import { describe, expect, it } from 'vitest';
import { labelFor, lookupCharacteristic, lookupService } from './assignedNumbers';

describe('assignedNumbers', () => {
  it('maps Battery Service 0x180f', () => {
    expect(lookupService('0000180f-0000-1000-8000-00805f9b34fb')).toBe('Battery');
  });
  it('maps Heart Rate Measurement 0x2a37', () => {
    expect(lookupCharacteristic('00002a37-0000-1000-8000-00805f9b34fb')).toBe(
      'Heart Rate Measurement',
    );
  });
  it('returns undefined for unknown', () => {
    expect(lookupService('12345678-1234-1234-1234-123456789012')).toBeUndefined();
  });
  it('labelFor returns bare uuid when unknown', () => {
    const uuid = '12345678-1234-1234-1234-123456789012';
    expect(labelFor(uuid, 'service')).toBe(uuid);
  });
  it('labelFor returns name + short uuid when known', () => {
    expect(labelFor('0000180d-0000-1000-8000-00805f9b34fb', 'service')).toBe('Heart Rate (180d)');
  });
});
