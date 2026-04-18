import { labelFor } from '@/lib/ble/assignedNumbers';
import {
  hexStringToBytes,
  textToBytes,
  tokenize,
  tokensToBytes,
  uint8ArrayLiteralToBytes,
} from '@/lib/ble/format';
import type { Characteristic, Service, TerminalEntry } from '@/schemas/ble';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { useState } from 'react';

type WriteMode = 'grammar' | 'hex' | 'utf8' | 'uint8';

type Props = {
  isOpen: boolean;
  service: Service | null;
  characteristic: Characteristic | null;
  onClose: () => void;
  onRead: () => void;
  onWrite: (bytes: number[], withoutResponse: boolean) => void;
  onToggleNotify: (shouldStart: boolean) => void;
  isNotifying: boolean;
  history: TerminalEntry[];
  onReplay: (entry: TerminalEntry) => void;
};

function encodeBytes(mode: WriteMode, input: string): number[] {
  switch (mode) {
    case 'grammar':
      return tokensToBytes(tokenize(input));
    case 'hex':
      return hexStringToBytes(input);
    case 'utf8':
      return textToBytes(input);
    case 'uint8':
      return uint8ArrayLiteralToBytes(input);
  }
}

export default function CharacteristicSheet({
  isOpen,
  service,
  characteristic,
  onClose,
  onRead,
  onWrite,
  onToggleNotify,
  isNotifying,
  history,
  onReplay,
}: Props) {
  const [mode, setMode] = useState<WriteMode>('grammar');
  const [input, setInput] = useState('');
  const [withoutResponse, setWithoutResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!service || !characteristic) return null;
  const props = characteristic.properties;

  const handleWrite = () => {
    try {
      const bytes = encodeBytes(mode, input);
      onWrite(bytes, withoutResponse && !!props.writeWithoutResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{labelFor(characteristic.uuid, 'characteristic')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>
              <IonNote>Service</IonNote>
              <p className="text-xs font-mono">{labelFor(service.uuid, 'service')}</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <div className="flex gap-2 w-full py-2 flex-wrap">
              {props.read ? <IonButton onClick={onRead}>Read</IonButton> : null}
              {props.notify || props.indicate ? (
                <IonButton
                  color={isNotifying ? 'danger' : 'primary'}
                  onClick={() => onToggleNotify(!isNotifying)}
                >
                  {isNotifying ? 'Stop notify' : 'Start notify'}
                </IonButton>
              ) : null}
            </div>
          </IonItem>
        </IonList>

        {props.write || props.writeWithoutResponse ? (
          <>
            <IonItem lines="none">
              <IonLabel>Write</IonLabel>
            </IonItem>
            <IonItem>
              <IonSegment value={mode} onIonChange={(e) => setMode(e.detail.value as WriteMode)}>
                <IonSegmentButton value="grammar">
                  <IonLabel>Tokens</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="hex">
                  <IonLabel>Hex</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="utf8">
                  <IonLabel>UTF-8</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="uint8">
                  <IonLabel>Uint8</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonItem>
            <IonItem>
              <IonTextarea
                autoGrow
                label={
                  mode === 'grammar'
                    ? 'Tokens (e.g. 0x01 h 12)'
                    : mode === 'hex'
                      ? 'Hex (e.g. 01 02 0A)'
                      : mode === 'utf8'
                        ? 'UTF-8 text'
                        : 'Uint8 array (e.g. [1, 2, 255])'
                }
                labelPlacement="stacked"
                value={input}
                onIonInput={(e) => setInput(e.detail.value ?? '')}
              />
            </IonItem>
            {props.writeWithoutResponse ? (
              <IonItem>
                <IonCheckbox
                  checked={withoutResponse}
                  onIonChange={(e) => setWithoutResponse(e.detail.checked)}
                >
                  <IonLabel>Write without response</IonLabel>
                </IonCheckbox>
              </IonItem>
            ) : null}
            <div className="p-4">
              <IonButton expand="block" onClick={handleWrite} disabled={!input}>
                Send write
              </IonButton>
            </div>
          </>
        ) : null}

        {history.length > 0 ? (
          <IonList>
            <IonItem lines="none">
              <IonLabel>History ({history.length})</IonLabel>
            </IonItem>
            {history
              .slice()
              .reverse()
              .slice(0, 20)
              .map((h) => (
                <IonItem key={h.id} button onClick={() => onReplay(h)}>
                  <IonLabel>
                    <p className="font-mono text-xs">
                      {h.bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ')}
                    </p>
                    <IonNote>
                      {h.kind} · {new Date(h.timestamp).toLocaleTimeString()}
                    </IonNote>
                  </IonLabel>
                </IonItem>
              ))}
          </IonList>
        ) : null}
        <IonToast
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          message={error ?? ''}
          duration={3500}
          color="danger"
        />
      </IonContent>
    </IonModal>
  );
}
