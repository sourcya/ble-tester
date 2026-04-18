import type { TerminalEntry } from '@/schemas/ble';
import { useCallback, useSyncExternalStore } from 'react';

const MAX_ENTRIES = 1000;

let entries: TerminalEntry[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const cb of listeners) cb();
}

function append(entry: TerminalEntry) {
  entries = [...entries, entry].slice(-MAX_ENTRIES);
  emit();
}

function clearAll() {
  entries = [];
  emit();
}

export function clearTerminalLog() {
  clearAll();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return entries;
}

export function useTerminalLog() {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const addEntry = useCallback(
    (partial: Omit<TerminalEntry, 'id' | 'timestamp'> & { timestamp?: number }) => {
      const entry: TerminalEntry = {
        id: crypto.randomUUID(),
        timestamp: partial.timestamp ?? Date.now(),
        charUuid: partial.charUuid,
        direction: partial.direction,
        kind: partial.kind,
        bytes: partial.bytes,
      };
      append(entry);
      return entry;
    },
    [],
  );

  const clear = useCallback(() => clearAll(), []);

  const filter = useCallback(
    (predicate: (e: TerminalEntry) => boolean) => all.filter(predicate),
    [all],
  );

  const historyFor = useCallback(
    (charUuid: string) => all.filter((e) => e.charUuid === charUuid && e.direction === 'out'),
    [all],
  );

  return { entries: all, addEntry, clear, filter, historyFor };
}
