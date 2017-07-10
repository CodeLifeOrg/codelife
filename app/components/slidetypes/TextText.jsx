import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextText.css";

export default class TextText extends Component {

  render() {
    
    const {t, htmlcontent1, htmlcontent2} = this.props;

    return (
      <div className="tt_container">
        <div className="tt_textcontainerleft" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div className="tt_textcontainerright" dangerouslySetInnerHTML={{__html: htmlcontent2}} />
        
        <div className="clear" />
      </div>
    );
  }
}
