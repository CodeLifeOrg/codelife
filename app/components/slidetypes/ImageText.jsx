import React, {Component} from "react";
import {translate} from "react-i18next";
import "./ImageText.css";

export default class ImageText extends Component {

  render() {
    
    const {t, id, htmlcontent1} = this.props;

    return (
      <div className="it_container">
        <div className="it_imgcontainer"><img src={`/slide_images/${id}.jpg`} /></div>
        <div className="it_textcontainer" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        
        <div className="clear" />
      </div>
    );
  }
}
