import type { TerminalEntry } from '@/schemas/ble';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function toCsv(entries: TerminalEntry[]): string {
  const header = 'timestamp,direction,kind,charUuid,hex,ascii';
  const rows = entries.map((e) => {
    const hex = e.bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
    const ascii = String.fromCharCode(...e.bytes).replace(
      // biome-ignore lint/suspicious/noControlCharactersInRegex: sanitizing control bytes for CSV
      /[\u0000-\u001f",]/g,
      '.',
    );
    return `${e.timestamp},${e.direction},${e.kind},${e.charUuid},${hex},"${ascii}"`;
  });
  return [header, ...rows].join('\n');
}

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportLog(entries: TerminalEntry[], format: 'csv' | 'json'): Promise<void> {
  const content = format === 'csv' ? toCsv(entries) : JSON.stringify(entries, null, 2);
  const mime = format === 'csv' ? 'text/csv' : 'application/json';
  const filename = `ble-tester-${Date.now()}.${format}`;

  if (Capacitor.isNativePlatform()) {
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title: 'BLE log', url: result.uri, dialogTitle: 'Share BLE log' });
  } else {
    download(filename, content, mime);
  }
}
