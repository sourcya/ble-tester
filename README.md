# BLE Tester

A cross-platform BLE central-role tester. Scan, connect, read, write, notify, and exercise the full plugin surface of [`@capacitor-community/bluetooth-le`](https://github.com/capacitor-community/bluetooth-le).

**Stack:** Vite 6 · React 19 · Ionic React 8 · Capacitor 8 · TypeScript 5.7 · Zod 4 · TanStack Query 5 · Tailwind 4 · Vitest 3

## Features

- **Live scanning** via `requestLEScan` — streaming results with RSSI, txPower, local name, service UUIDs, manufacturer and service data.
- **Native picker** via `requestDevice` for quick one-shot connection.
- **Full service + characteristic explorer** with every standard property flag (R, W, WNR, N, I, B, AS, RW).
- **Write surface**: token grammar (`0x01 h 12`), hex string, UTF-8 text, `Uint8` array literal.
- **MTU-aware chunked writes** — splits payloads at `mtu - 3` automatically.
- **`writeWithoutResponse`** toggle per-write.
- **Notifications** with start/stop per characteristic.
- **Write history** — replay any previously-sent payload.
- **Live RSSI** sparkline + dBm readout while connected.
- **Connection priority** selector (Balanced / High / Low power).
- **Rediscover services** for peripherals with dynamic profiles.
- **Smart parsers** for standard characteristics (Battery Level, Heart Rate, Temperature, Device Info, …).
- **Bluetooth SIG UUID registry** — human labels next to every UUID.
- **ATT error decoding** — maps status codes (GATT 133, 0x05, 0x0F, …) to readable hints.
- **Bluetooth state listener** — UI reacts when BT is toggled in quick settings.
- **System settings deep links** — jump to Bluetooth / Location / App settings.
- **Log export** — share as CSV or JSON (Capacitor Share on device, download on web).
- **Search + filter** terminal log by hex, ASCII, UUID, or kind.
- **Relative + delta timestamps** on every entry.
- **Dark mode** via `prefers-color-scheme`.

## Write grammar

Space-separated tokens:

| Token       | Meaning                            |
|-------------|------------------------------------|
| `0x01`      | hex byte (0–0xFF)                  |
| `12`        | decimal byte (0–255)               |
| single char | ASCII code point (e.g. `h` → 0x68) |

Example: `0x01 h 12` → `[0x01, 0x68, 0x0C]`.

The write sheet has four tabs: **Tokens** (grammar above), **Hex** (`01 02 0A` or `01020A`), **UTF-8** (plain text), and **Uint8** (`[1, 2, 255]` or `1,2,255`).

## Development

```bash
npm install
npm run dev         # Vite dev server (Web Bluetooth works in Chrome/Edge)
npm run typecheck
npm test
npm run build       # → build/
```

### Android

```bash
npm run android:build   # assembleDebug
npm run android:open    # open in Android Studio
```

First-time setup:

```bash
npx cap add android
```

Then edit `android/app/src/main/AndroidManifest.xml` and add these permissions so scanning works on Android 12+ without location:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation"
    tools:targetApi="s" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

The `androidNeverForLocation: true` flag is already set by default in [`src/hooks/useSettings.ts`](src/hooks/useSettings.ts) and passed to `BleClient.initialize`.

### Web

Web Bluetooth is available in Chrome and Edge. Continuous `requestLEScan` is behind a flag in most browsers — see the [Web Bluetooth implementation status](https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md). The one-shot device picker (`requestDevice`) works without a flag.

## Extending `smartParsers.ts`

Add an entry keyed by 16-bit UUID to the `parsers` map in `src/lib/ble/smartParsers.ts`:

```typescript
'2a6e': (b) => {
  if (b.length < 2) return null;
  const dv = new DataView(Uint8Array.from(b).buffer);
  const signed = dv.getInt16(0, true);
  return { label: 'Temperature', value: `${(signed / 100).toFixed(2)} °C` };
},
```

## Project layout

```
src/
├── lib/ble/       # client, format, mtu, assignedNumbers, smartParsers, attErrors
├── lib/export.ts  # CSV/JSON share-or-download
├── lib/storage.ts # Zod-validated localStorage
├── schemas/       # Zod schemas for every external boundary
├── hooks/         # TanStack Query + subscription hooks
├── components/    # Ionic UI
├── pages/         # TerminalPage, SettingsPage
└── test/          # Vitest setup
```

## Deployment

- **Web**: `firebase deploy` (config in `firebase.json`). Hosted at [sourcya-ble-tester.web.app](https://sourcya-ble-tester.web.app/).
- **Android**: `codemagic.yaml` builds a release APK on every push to `main`. `build_android` runs a local debug build and copies to `APK/`.

## Links

- Plugin docs: https://github.com/capacitor-community/bluetooth-le
- Assigned Numbers: https://www.bluetooth.com/specifications/assigned-numbers/
