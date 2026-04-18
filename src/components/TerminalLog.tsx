import { labelFor } from '@/lib/ble/assignedNumbers';
import { bytesToParsed } from '@/lib/ble/format';
import { smartParse } from '@/lib/ble/smartParsers';
import type { TerminalEntry } from '@/schemas/ble';
import { IonBadge, IonItem, IonLabel, IonList, IonNote, IonSearchbar } from '@ionic/react';
import { useMemo, useState } from 'react';

type Props = {
  entries: TerminalEntry[];
};

function formatRelative(ts: number, anchor: number): string {
  const ms = ts - anchor;
  if (ms < 1000) return `+${ms}ms`;
  return `+${(ms / 1000).toFixed(2)}s`;
}

export default function TerminalLog({ entries }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      const parsed = bytesToParsed(e.bytes);
      return (
        e.charUuid.toLowerCase().includes(q) ||
        parsed.ascii.toLowerCase().includes(q) ||
        parsed.hex.toLowerCase().includes(q) ||
        e.kind.includes(q)
      );
    });
  }, [entries, search]);

  const anchor = entries[0]?.timestamp ?? Date.now();

  return (
    <>
      <IonSearchbar
        placeholder="Filter by hex, ASCII, UUID, kind…"
        value={search}
        onIonInput={(e) => setSearch(e.detail.value ?? '')}
      />
      <IonList>
        {filtered.length === 0 ? (
          <IonItem lines="none">
            <IonLabel color="medium">No entries.</IonLabel>
          </IonItem>
        ) : null}
        {filtered.map((e, i) => {
          const parsed = bytesToParsed(e.bytes);
          const smart = smartParse(e.charUuid, e.bytes);
          const prev = i > 0 ? filtered[i - 1] : undefined;
          const delta = prev ? `Δ${e.timestamp - prev.timestamp}ms` : '';
          return (
            <IonItem key={e.id} lines="inset">
              <IonLabel>
                <div className="flex items-center gap-2">
                  <IonBadge color={e.direction === 'in' ? 'success' : 'primary'}>
                    {e.direction === 'in' ? '↓' : '↑'} {e.kind}
                  </IonBadge>
                  <IonNote>
                    {formatRelative(e.timestamp, anchor)} {delta}
                  </IonNote>
                </div>
                <h4 className="text-xs font-mono">{labelFor(e.charUuid, 'characteristic')}</h4>
                {smart ? (
                  <p className="text-sm">
                    <strong>{smart.label}:</strong> {smart.value}
                  </p>
                ) : null}
                <p className="font-mono text-xs">hex: {parsed.hex || '(empty)'}</p>
                <p className="font-mono text-xs">ascii: {parsed.ascii || '(empty)'}</p>
                <p className="font-mono text-xs">uint8: [{parsed.uint8.join(', ')}]</p>
              </IonLabel>
            </IonItem>
          );
        })}
      </IonList>
    </>
  );
}
