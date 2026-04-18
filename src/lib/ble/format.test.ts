import { describe, expect, it } from 'vitest';
import {
  bytesToParsed,
  hexStringToBytes,
  textToBytes,
  tokenize,
  tokensToBytes,
  uint8ArrayLiteralToBytes,
} from './format';

describe('tokenize', () => {
  it('parses hex, decimal, ascii tokens', () => {
    const toks = tokenize('0x01 h 12');
    expect(toks).toEqual([
      { kind: 'hex', value: 1 },
      { kind: 'ascii', value: 'h' },
      { kind: 'uint8', value: 12 },
    ]);
  });

  it('converts to bytes', () => {
    expect(tokensToBytes(tokenize('0xFF 0 a'))).toEqual([0xff, 0, 97]);
  });

  it('rejects unrecognized token', () => {
    expect(() => tokenize('hi')).toThrow();
  });

  it('rejects hex > 255', () => {
    expect(() => tokenize('0x100')).toThrow();
  });
});

describe('hexStringToBytes', () => {
  it('parses spaced hex', () => {
    expect(hexStringToBytes('01 02 0A')).toEqual([1, 2, 10]);
  });
  it('parses continuous hex', () => {
    expect(hexStringToBytes('01020A')).toEqual([1, 2, 10]);
  });
  it('rejects odd-length hex', () => {
    expect(() => hexStringToBytes('010')).toThrow();
  });
});

describe('textToBytes', () => {
  it('encodes utf-8', () => {
    expect(textToBytes('hi')).toEqual([104, 105]);
  });
});

describe('uint8ArrayLiteralToBytes', () => {
  it('parses bracketed literal', () => {
    expect(uint8ArrayLiteralToBytes('[1, 2, 255]')).toEqual([1, 2, 255]);
  });
  it('parses plain csv', () => {
    expect(uint8ArrayLiteralToBytes('1,2,255')).toEqual([1, 2, 255]);
  });
  it('rejects out-of-range values', () => {
    expect(() => uint8ArrayLiteralToBytes('256')).toThrow();
  });
});

describe('bytesToParsed', () => {
  it('returns ascii, hex, uint8', () => {
    const parsed = bytesToParsed([0x68, 0x69]);
    expect(parsed.ascii).toBe('hi');
    expect(parsed.hex).toBe('6869');
    expect(parsed.uint8).toEqual([0x68, 0x69]);
  });

  it('round-trips grammar', () => {
    const tokens = tokenize('0x01 h 12');
    const bytes = tokensToBytes(tokens);
    const parsed = bytesToParsed(bytes);
    expect(parsed.uint8).toEqual([1, 104, 12]);
  });
});
