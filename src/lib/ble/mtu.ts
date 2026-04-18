import { numbersToDataView } from '@capacitor-community/bluetooth-le';

export const DEFAULT_MTU = 23;
export const ATT_HEADER_OVERHEAD = 3;

export function maxAttributeValueSize(mtu: number): number {
  return Math.max(1, mtu - ATT_HEADER_OVERHEAD);
}

export function chunkBytes(bytes: number[], mtu: number): DataView[] {
  const size = maxAttributeValueSize(mtu);
  if (bytes.length === 0) return [numbersToDataView([])];
  const chunks: DataView[] = [];
  for (let i = 0; i < bytes.length; i += size) {
    chunks.push(numbersToDataView(bytes.slice(i, i + size)));
  }
  return chunks;
}
