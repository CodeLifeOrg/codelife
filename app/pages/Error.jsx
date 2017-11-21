import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Error.css";

class Error extends Component {

  render() {
    const {t} = this.props;
    return <div id="Error" className="pt-non-ideal-state">
      <div className="pt-non-ideal-state-visual pt-non-ideal-state-icon">
        <img src="/avatars/404.png" />
      </div>
      <h4 className="pt-non-ideal-state-title">404</h4>
      <div className="pt-non-ideal-state-description">{ t("404") }</div>
    </div>;
  }
}

export default translate()(Error);
