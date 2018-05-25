import React, {Component} from "react";
import {Intent, Spinner} from "@blueprintjs/core";
import {translate} from "react-i18next";

import "./Loading.css";

class Loading extends Component {

  render() {
    const {label, t} = this.props;

    return (
      <div className="loading">
        <div className="loading-inner">
          <div className="loading-spinner-container">
            <Spinner intent={Intent.WARNING} />
          </div>
          { label &&
            <h2 className="loading-title font-md">{ t("Loading") }...</h2>
          }
        </div>
      </div>
    );
  }
}

Loading.defaultProps = {
  dark: false,
  label: true
};

export default translate()(Loading);
