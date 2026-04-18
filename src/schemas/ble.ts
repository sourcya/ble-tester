import { z } from 'zod';

export const DeviceSchema = z.object({
  deviceId: z.string().min(1),
  name: z.string().optional(),
  uuids: z.array(z.string()).optional(),
});
export type Device = z.infer<typeof DeviceSchema>;

export const CharacteristicPropsSchema = z.object({
  broadcast: z.boolean().optional(),
  read: z.boolean().optional(),
  writeWithoutResponse: z.boolean().optional(),
  write: z.boolean().optional(),
  notify: z.boolean().optional(),
  indicate: z.boolean().optional(),
  authenticatedSignedWrites: z.boolean().optional(),
  reliableWrite: z.boolean().optional(),
  writableAuxiliaries: z.boolean().optional(),
  extendedProperties: z.boolean().optional(),
  notifyEncryptionRequired: z.boolean().optional(),
  indicateEncryptionRequired: z.boolean().optional(),
});
export type CharacteristicProps = z.infer<typeof CharacteristicPropsSchema>;

export const DescriptorSchema = z.object({
  uuid: z.string(),
});
export type Descriptor = z.infer<typeof DescriptorSchema>;

export const CharacteristicSchema = z.object({
  uuid: z.string(),
  properties: CharacteristicPropsSchema,
  descriptors: z.array(DescriptorSchema).optional(),
});
export type Characteristic = z.infer<typeof CharacteristicSchema>;

export const ServiceSchema = z.object({
  uuid: z.string(),
  characteristics: z.array(CharacteristicSchema),
});
export type Service = z.infer<typeof ServiceSchema>;

export const WriteTokenSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('hex'), value: z.number().int().min(0).max(255) }),
  z.object({ kind: z.literal('ascii'), value: z.string().length(1) }),
  z.object({ kind: z.literal('uint8'), value: z.number().int().min(0).max(255) }),
]);
export type WriteToken = z.infer<typeof WriteTokenSchema>;

export const ScanModeSchema = z.union([z.literal(0), z.literal(1), z.literal(2)]);
export type ScanMode = z.infer<typeof ScanModeSchema>;

export const FiltersSchema = z.object({
  name: z.string().optional(),
  namePrefix: z.string().optional(),
  services: z.array(z.string()).optional(),
  optionalServices: z.array(z.string()).optional(),
  scanMode: ScanModeSchema.default(1),
  allowDuplicates: z.boolean().default(false),
});
export type Filters = z.infer<typeof FiltersSchema>;

export const TerminalEntrySchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  charUuid: z.string(),
  direction: z.enum(['in', 'out']),
  kind: z.enum(['read', 'write', 'writeNoResponse', 'notify']),
  bytes: z.array(z.number().int().min(0).max(255)),
});
export type TerminalEntry = z.infer<typeof TerminalEntrySchema>;

export const DisplayStringsSchema = z.object({
  scanning: z.string(),
  cancel: z.string(),
  availableDevices: z.string(),
  noDeviceFound: z.string(),
});
export type DisplayStrings = z.infer<typeof DisplayStringsSchema>;

export const RecentDeviceSchema = z.object({
  deviceId: z.string(),
  nickname: z.string().optional(),
  lastSeen: z.number(),
});
export type RecentDevice = z.infer<typeof RecentDeviceSchema>;

export const ScanStrategySchema = z.enum(['picker', 'live']);
export type ScanStrategy = z.infer<typeof ScanStrategySchema>;

export const SettingsSchema = z.object({
  filters: FiltersSchema,
  displayStrings: DisplayStringsSchema,
  androidNeverForLocation: z.boolean(),
  recents: z.array(RecentDeviceSchema),
  skipDescriptorDiscovery: z.boolean(),
  scanStrategy: ScanStrategySchema.default('picker'),
  scanTimeoutMs: z.number().int().min(3000).max(120000).default(15000),
  connectTimeoutMs: z.number().int().min(3000).max(60000).default(15000),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_DISPLAY_STRINGS: DisplayStrings = {
  scanning: 'Scanning…',
  cancel: 'Cancel',
  availableDevices: 'Available devices',
  noDeviceFound: 'No device found',
};

export const DEFAULT_SETTINGS: Settings = {
  filters: { scanMode: 1, allowDuplicates: false },
  displayStrings: DEFAULT_DISPLAY_STRINGS,
  androidNeverForLocation: true,
  recents: [],
  skipDescriptorDiscovery: false,
  scanStrategy: 'picker',
  scanTimeoutMs: 15000,
  connectTimeoutMs: 15000,
};
