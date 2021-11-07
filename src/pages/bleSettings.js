import React from "react";
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonItem,
  IonCard,
  IonList,
  IonTitle,
  IonCardHeader,
  IonToolbar,
  IonLabel,
  IonCardContent,
} from "@ionic/react";
import { Loading } from "../components";

class BleSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      optionalService: null,
      savedOptionalService: null,
      prefix: null,
      savedPrefix: null,
      loading: false,
    };
  }
  setPrefix(prefix) {
    this.setState({
      prefix: prefix,
    });
  }
  removePrefix() {
    localStorage.removeItem("prefix");
    this.setState({
      savedPrefix: null,
    });
  }
  storePrefix() {
    try {
      this.setState({
        loading: true,
      });
      const prefix = this.state.prefix;
      if (prefix) {
        localStorage.setItem("prefix", prefix);
      }
      const savedPrefix = localStorage.getItem("prefix");
      if (savedPrefix) {
        this.setState({
          savedPrefix: savedPrefix,
        });
      }
      this.setState({
        loading: false,
      });
    } catch {
      this.setState({
        loading: false,
        prefix: null,
      });
    }
  }
  setOptionalService(optionalService) {
    this.setState({
      optionalService: optionalService,
    });
  }
  removeOptionalService() {
    localStorage.removeItem("optionalService");
    this.setState({
      savedOptionalService: null,
    });
  }
  storeOptionalService() {
    try {
      this.setState({
        loading: true,
      });
      const optionalService = this.state.optionalService;
      if (optionalService) {
        localStorage.setItem("optionalService", optionalService);
      }
      const savedOptionalService = localStorage.getItem("optionalService");
      if (savedOptionalService) {
        this.setState({
          savedOptionalService: savedOptionalService,
        });
      }
      this.setState({
        loading: false,
      });
    } catch {
      this.setState({
        loading: false,
        optionalService: null,
      });
    }
  }
  componentDidMount() {
    try {
      this.setState({
        loading: true,
      });
      const savedOptionalService = localStorage.getItem("optionalService");
      const savedPrefix = localStorage.getItem("prefix");
      if (savedOptionalService) {
        this.setState({
          savedOptionalService: savedOptionalService,
        });
      }
      if (savedPrefix) {
        this.setState({
          savedPrefix: savedPrefix,
        });
      }
      this.setState({
        loading: false,
      });
    } catch {
      this.setState({
        loading: false,
        optionalService: null,
        prefix: null,
      });
    }
  }
  render() {
    return (
      <IonPage>
        <IonContent>
          <Loading loading={this.state.loading} />
          <IonCard>
            <IonCardHeader>
              <IonToolbar>
                <IonTitle>BLE Settings</IonTitle>
              </IonToolbar>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none">
                <IonInput
                  placeholder="Type Service UUID"
                  onIonChange={(e) => this.setOptionalService(e.detail.value)}
                ></IonInput>
                <IonButton onClick={() => this.storeOptionalService()}>
                  Save
                </IonButton>
              </IonItem>
              <IonItem lines="none">
                <IonInput
                  placeholder="Type Devices Prefix Filter"
                  onIonChange={(e) => this.setPrefix(e.detail.value)}
                ></IonInput>
                <IonButton onClick={() => this.storePrefix()}>Save</IonButton>
              </IonItem>
            </IonCardContent>
          </IonCard>
          {this.state.savedOptionalService && (
            <IonCard>
              <IonCardHeader>
                <IonToolbar>
                  <IonLabel>Saved Services</IonLabel>
                </IonToolbar>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                  <IonLabel text-wrap >{this.state.savedOptionalService}</IonLabel>
                    <IonButton onClick={() => this.removeOptionalService()}>
                      Delete
                    </IonButton>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
          {this.state.savedPrefix && (
            <IonCard>
              <IonCardHeader>
                <IonToolbar>
                  <IonLabel>Saved Prefixes</IonLabel>
                </IonToolbar>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel text-wrap >{this.state.savedPrefix}</IonLabel>
                    <IonButton onClick={() => this.removePrefix()}>
                      Delete
                    </IonButton>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
        </IonContent>
      </IonPage>
    );
  }
}
export default BleSettings;
