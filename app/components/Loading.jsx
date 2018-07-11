import React, {Component} from "react";
import {translate} from "react-i18next";
import LoadingSpinner from "components/LoadingSpinner";
import Clouds from "components/Clouds";

import "./Loading.css";

/**
 * Loading is explicitly used by CANON itself for any page that has canon "needs", which is why this
 * is a full container page with <clouds>. The LoadingSpinner component was separated out for embedded use (no clouds)
 */

class Loading extends Component {

  render() {

    return (
      <div className="container">
        <Clouds />
        <LoadingSpinner />
      </div>
    );
  }
}

Loading.defaultProps = {
  dark: false,
  label: true
};

export default translate()(Loading);
