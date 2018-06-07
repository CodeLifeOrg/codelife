import React, {Component} from "react";
import {translate} from "react-i18next";
import LoadingSpinner from "components/LoadingSpinner";
import Clouds from "components/Clouds";

import "./Loading.css";

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
