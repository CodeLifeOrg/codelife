import React, {Component} from "react";
import {Intent, Spinner} from "@blueprintjs/core";
import {translate} from "react-i18next";

import "./LoadingSpinner.css";

/**
 * Loading spinner for a huge number of components in Codelife, mostly used in render cycles while 
 * waiting for axios to return with data
 */

class LoadingSpinner extends Component {

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

LoadingSpinner.defaultProps = {
  dark: false,
  label: true
};

export default translate()(LoadingSpinner);
