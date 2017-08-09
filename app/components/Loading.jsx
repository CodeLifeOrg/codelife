import React, {Component} from "react";
import {Intent, Spinner} from "@blueprintjs/core";
import {translate} from "react-i18next";

import "./Loading.css";

class Loading extends Component {

  render() {
    const {t} = this.props;

    return (
      <div id="loading">
        <Spinner intent={Intent.WARNING} />
        <h1 className="title">{ t("Loading") }...</h1>
      </div>
    );

  }

}

export default translate()(Loading);
