import React, {Component} from "react";
import {translate} from "react-i18next";

class Privacy extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {t} = this.props;

    return (
      <div id="about-container">
        <h1>{ t("Privacy Policy") }</h1>
      </div>
    );
  }
}

export default translate()(Privacy);
