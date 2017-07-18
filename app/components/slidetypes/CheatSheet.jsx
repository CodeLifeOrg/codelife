import React, {Component} from "react";
import {translate} from "react-i18next";
import "./CheatSheet.css";

export default class CheatSheet extends Component {

  render() {
    
    const {t, htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="cs_container">
        <div id="cs_text-container" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div className="clear" />
      </div>
    );
  }
}
