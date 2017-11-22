import React, {Component} from "react";
import {Intent, Spinner} from "@blueprintjs/core";
import {translate} from "react-i18next";

import "./Loading.css";

class Loading extends Component {

  render() {
    const {dark, t} = this.props;

    return (
      <div id="loading" className={ dark ? "dark" : "light" }>
        <Spinner intent={Intent.WARNING} />
        <h1 className="title">{ t("Loading") }...</h1>
      </div>
    );

  }

}

Loading.defaultProps = {
  dark: false
};

export default translate()(Loading);
