import { describe, expect, it } from 'vitest';
import { chunkBytes, maxAttributeValueSize } from './mtu';

function bytesOf(dv: DataView): number[] {
  return Array.from(new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength));
}

describe('chunkBytes', () => {
  it('returns a single empty chunk for empty input', () => {
    const chunks = chunkBytes([], 23);
    expect(chunks).toHaveLength(1);
    expect(bytesOf(chunks[0]!)).toEqual([]);
  });

  it('does not split when payload fits in MTU - 3', () => {
    const payload = [1, 2, 3, 4, 5];
    const chunks = chunkBytes(payload, 23);
    expect(chunks).toHaveLength(1);
    expect(bytesOf(chunks[0]!)).toEqual(payload);
  });

  it('splits at mtu - 3 boundaries', () => {
    const mtu = 23;
    const size = maxAttributeValueSize(mtu);
    const payload = Array.from({ length: size * 2 + 3 }, (_, i) => i % 256);
    const chunks = chunkBytes(payload, mtu);
    expect(chunks).toHaveLength(3);
    expect(bytesOf(chunks[0]!).length).toBe(size);
    expect(bytesOf(chunks[1]!).length).toBe(size);
    expect(bytesOf(chunks[2]!).length).toBe(3);
  });

  it('handles MTU of 247 (negotiated on modern Android)', () => {
    const mtu = 247;
    const payload = Array.from({ length: 500 }, (_, i) => i % 256);
    const chunks = chunkBytes(payload, mtu);
    expect(chunks).toHaveLength(Math.ceil(500 / (mtu - 3)));
  });
});
