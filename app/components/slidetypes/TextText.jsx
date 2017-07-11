import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextText.css";

export default class TextText extends Component {

  render() {
    
    const {t, htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="tt_container">
        <div id="tt_text-container-left" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div id="tt_text-container-right" dangerouslySetInnerHTML={{__html: htmlcontent2}} />
        
        <div className="clear" />
      </div>
    );
  }
}
