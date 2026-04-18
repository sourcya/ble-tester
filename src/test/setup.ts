import '@testing-library/jest-dom/vitest';

// Polyfill crypto.randomUUID for jsdom
if (!('randomUUID' in globalThis.crypto)) {
  (globalThis.crypto as Crypto & { randomUUID: () => string }).randomUUID = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2)}` as ReturnType<Crypto['randomUUID']>;
}
