import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";

class Home extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>Codelife</h1>
        <span>{ t("Translated Content") }</span>
      </div>
    );
  }
}

export default translate()(Home);