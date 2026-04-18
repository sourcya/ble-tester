import { describe, expect, it } from 'vitest';
import { decodeBleError } from './attErrors';

describe('decodeBleError', () => {
  it('appends GATT 133 hint', () => {
    expect(decodeBleError(new Error('Connection failed, status: 133'))).toContain('GATT_ERROR');
  });
  it('appends ATT 0x05 hint', () => {
    expect(decodeBleError(new Error('Error: 0x05 from peripheral'))).toContain(
      'Insufficient authentication',
    );
  });
  it('passes through unknown codes', () => {
    expect(decodeBleError(new Error('Something random happened'))).toContain('Something random');
  });
});
