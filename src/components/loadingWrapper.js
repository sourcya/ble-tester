import React from "react";
import {
  IonLoading
} from "@ionic/react";

class LoadingWrapper extends React.Component {
    render() {
        return (
            <IonLoading
            isOpen={this.props.loading}
            message={"loading..."}
            duration={10000}
          />
        )
    }
}
export default LoadingWrapper;