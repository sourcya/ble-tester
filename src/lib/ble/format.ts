import { type WriteToken, WriteTokenSchema } from '@/schemas/ble';
import {
  dataViewToHexString,
  dataViewToNumbers,
  dataViewToText,
  numbersToDataView,
} from '@capacitor-community/bluetooth-le';

export type ParsedValue = {
  ascii: string;
  hex: string;
  uint8: number[];
};

export function parseValue(value: DataView): ParsedValue {
  return {
    ascii: dataViewToText(value),
    hex: dataViewToHexString(value),
    uint8: dataViewToNumbers(value),
  };
}

export function bytesToParsed(bytes: number[] | Uint8Array): ParsedValue {
  const arr = Array.from(bytes);
  const dv = numbersToDataView(arr);
  return parseValue(dv);
}

/**
 * Grammar: space-separated tokens
 *   0xNN          → hex byte (0..255)
 *   NN            → decimal uint8 (0..255)
 *   single char   → ASCII char (one code point, taken literally)
 */
export function tokenize(input: string): WriteToken[] {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  const out: WriteToken[] = [];
  for (const part of parts) {
    if (/^0x[0-9a-fA-F]+$/.test(part)) {
      const value = Number.parseInt(part.slice(2), 16);
      out.push(WriteTokenSchema.parse({ kind: 'hex', value }));
    } else if (/^\d+$/.test(part)) {
      const value = Number.parseInt(part, 10);
      out.push(WriteTokenSchema.parse({ kind: 'uint8', value }));
    } else if ([...part].length === 1) {
      out.push(WriteTokenSchema.parse({ kind: 'ascii', value: part }));
    } else {
      throw new Error(`Unrecognized token: "${part}"`);
    }
  }
  return out;
}

export function tokensToBytes(tokens: WriteToken[]): number[] {
  return tokens.map((t) => {
    switch (t.kind) {
      case 'hex':
      case 'uint8':
        return t.value;
      case 'ascii':
        return t.value.charCodeAt(0);
    }
  });
}

export function bytesToDataView(bytes: number[]): DataView {
  return numbersToDataView(bytes);
}

/** Parse a pure hex string input: accepts "01 02 0A" or "01020A". */
export function hexStringToBytes(input: string): number[] {
  const cleaned = input.replace(/[^0-9a-fA-F]/g, '');
  if (cleaned.length % 2 !== 0) throw new Error('Hex string must have an even number of nibbles');
  const out: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    out.push(Number.parseInt(cleaned.slice(i, i + 2), 16));
  }
  return out;
}

/** UTF-8 text → bytes. */
export function textToBytes(input: string): number[] {
  return Array.from(new TextEncoder().encode(input));
}

/** Uint8 array literal like "[1, 2, 255]" or "1, 2, 255". */
export function uint8ArrayLiteralToBytes(input: string): number[] {
  const trimmed = input.trim().replace(/^\[/, '').replace(/\]$/, '');
  return trimmed
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((tok) => {
      const n = Number.parseInt(tok, 10);
      if (!Number.isInteger(n) || n < 0 || n > 255) throw new Error(`Invalid byte: ${tok}`);
      return n;
    });
}
