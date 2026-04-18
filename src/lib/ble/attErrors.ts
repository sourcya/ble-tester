/**
 * ATT and GATT error-code lookup.
 * https://www.bluetooth.com/specifications/specs/core-specification-amendment-1/
 */
const ATT_ERRORS: Record<number, string> = {
  1: 'Invalid handle',
  2: 'Read not permitted',
  3: 'Write not permitted',
  4: 'Invalid PDU',
  5: 'Insufficient authentication',
  6: 'Request not supported',
  7: 'Invalid offset',
  8: 'Insufficient authorization',
  9: 'Prepare queue full',
  10: 'Attribute not found',
  11: 'Attribute not long',
  12: 'Insufficient encryption key size',
  13: 'Invalid attribute value length',
  14: 'Unlikely error',
  15: 'Insufficient encryption',
  16: 'Unsupported group type',
  17: 'Insufficient resources',
  18: 'Database out of sync',
  19: 'Value not allowed',
  128: 'Application error',
  253: 'CCCD improperly configured',
  254: 'Procedure already in progress',
  255: 'Out of range',
};

const ANDROID_GATT_ERRORS: Record<number, string> = {
  8: 'GATT connection timeout (0x08)',
  19: 'Remote user terminated connection (0x13)',
  22: 'Connection terminated by local host (0x16)',
  34: 'LMP response timeout (0x22)',
  62: 'Connection failed to be established (0x3E)',
  133: 'GATT_ERROR (0x85) — generic connection failure',
  147: 'GATT_INTERNAL_ERROR (0x93)',
  257: 'GATT_FAILURE (0x101)',
};

export function decodeBleError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const match = /(?:status|error)[\s:=]*(0x[0-9a-fA-F]+|\d+)/i.exec(message);
  if (!match?.[1]) return message;
  const code = match[1].startsWith('0x')
    ? Number.parseInt(match[1].slice(2), 16)
    : Number.parseInt(match[1], 10);
  const hint = ANDROID_GATT_ERRORS[code] ?? ATT_ERRORS[code];
  return hint ? `${message} — ${hint}` : message;
}
