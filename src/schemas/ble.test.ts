import { describe, expect, it } from 'vitest';
import {
  CharacteristicPropsSchema,
  CharacteristicSchema,
  DEFAULT_SETTINGS,
  DeviceSchema,
  FiltersSchema,
  ServiceSchema,
  SettingsSchema,
  WriteTokenSchema,
} from './ble';

describe('DeviceSchema', () => {
  it('accepts minimal device', () => {
    expect(DeviceSchema.parse({ deviceId: 'abc' })).toEqual({ deviceId: 'abc' });
  });
  it('rejects empty deviceId', () => {
    expect(DeviceSchema.safeParse({ deviceId: '' }).success).toBe(false);
  });
});

describe('CharacteristicSchema', () => {
  it('accepts full property set', () => {
    const char = {
      uuid: '00002a37-0000-1000-8000-00805f9b34fb',
      properties: {
        read: true,
        notify: true,
        write: false,
        writeWithoutResponse: false,
        indicate: false,
        broadcast: false,
      },
    };
    expect(CharacteristicSchema.parse(char).uuid).toBe(char.uuid);
  });
  it('accepts properties with missing optional flags', () => {
    const props = CharacteristicPropsSchema.parse({ read: true });
    expect(props.read).toBe(true);
  });
});

describe('ServiceSchema', () => {
  it('parses a service with no characteristics', () => {
    expect(ServiceSchema.parse({ uuid: 'x', characteristics: [] }).characteristics).toEqual([]);
  });
});

describe('WriteTokenSchema', () => {
  it('accepts each kind', () => {
    expect(WriteTokenSchema.parse({ kind: 'hex', value: 255 }).kind).toBe('hex');
    expect(WriteTokenSchema.parse({ kind: 'ascii', value: 'x' }).kind).toBe('ascii');
    expect(WriteTokenSchema.parse({ kind: 'uint8', value: 0 }).kind).toBe('uint8');
  });
  it('rejects out-of-range hex', () => {
    expect(WriteTokenSchema.safeParse({ kind: 'hex', value: 256 }).success).toBe(false);
  });
  it('rejects multi-char ascii', () => {
    expect(WriteTokenSchema.safeParse({ kind: 'ascii', value: 'xy' }).success).toBe(false);
  });
});

describe('FiltersSchema', () => {
  it('applies defaults', () => {
    const parsed = FiltersSchema.parse({});
    expect(parsed.scanMode).toBe(1);
    expect(parsed.allowDuplicates).toBe(false);
  });
});

describe('SettingsSchema', () => {
  it('round-trips the default settings', () => {
    const parsed = SettingsSchema.parse(DEFAULT_SETTINGS);
    expect(parsed).toEqual(DEFAULT_SETTINGS);
  });
});
