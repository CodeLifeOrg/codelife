import React, {Component} from "react";
import {translate} from "react-i18next";
import "./ImageText.css";

export default class ImageText extends Component {

  render() {
    
    const {t, id, htmlcontent1} = this.props;

    return (
      <div id="it_container">
        <div id="it_img-container"><img src={`/slide_images/${id}.jpg`} /></div>
        <div id="it_text-container" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        
        <div className="clear" />
      </div>
    );
  }
}
