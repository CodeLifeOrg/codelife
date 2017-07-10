import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextText.css";

export default class TextText extends Component {

  render() {
    
    const {t, id, htmlcontent} = this.props;

    const parsedLeft = htmlcontent.split("xxxxxxxxxx")[0];
    const parsedRight = htmlcontent.split("xxxxxxxxxx")[1];

    return (
      <div className="tt_container">
        <div className="tt_textcontainerleft" dangerouslySetInnerHTML={{__html: parsedLeft}} />
        <div className="tt_textcontainerright" dangerouslySetInnerHTML={{__html: parsedRight}} />
        
        <div className="clear" />
      </div>
    );
  }
}
