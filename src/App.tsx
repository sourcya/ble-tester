import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { bluetoothOutline, settingsOutline } from 'ionicons/icons';
import { Redirect, Route } from 'react-router-dom';

/* Core Ionic CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional Ionic CSS utilities */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from './lib/queryClient';
import SettingsPage from './pages/SettingsPage';
import TerminalPage from './pages/TerminalPage';

setupIonicReact({ mode: 'md' });

export default function App() {
  return (
    <IonApp>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/terminal" component={TerminalPage} />
                <Route exact path="/settings" component={SettingsPage} />
                <Route exact path="/">
                  <Redirect to="/terminal" />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="terminal" href="/terminal">
                  <IonIcon aria-hidden="true" icon={bluetoothOutline} />
                  <IonLabel>Terminal</IonLabel>
                </IonTabButton>
                <IonTabButton tab="settings" href="/settings">
                  <IonIcon aria-hidden="true" icon={settingsOutline} />
                  <IonLabel>Settings</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </IonApp>
  );
}
