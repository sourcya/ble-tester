import { clearTerminalLog } from '@/hooks/useTerminalLog';
import { fullyResetBle } from '@/lib/ble/client';
import type { DisplayStrings } from '@/schemas/ble';

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeReset(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export async function resetAll(
  initOptions: {
    androidNeverForLocation?: boolean;
    displayStrings?: DisplayStrings;
  } = {},
): Promise<void> {
  clearTerminalLog();
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      // ignore subscriber errors
    }
  }
  await fullyResetBle(initOptions);
}
