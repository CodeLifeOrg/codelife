import React, {Component} from "react";
import {translate} from "react-i18next";
import "./ImageText.css";

export default class ImageText extends Component {

  render() {
    
    const {t, id, htmlcontent} = this.props;

    return (
      <div className="it_container">
        <div className="it_imgcontainer"><img src={`/slide_images/${id}.jpg`} /></div>
        <div className="it_textcontainer" dangerouslySetInnerHTML={{__html: htmlcontent}} />
        
        <div className="clear" />
      </div>
    );
  }
}
