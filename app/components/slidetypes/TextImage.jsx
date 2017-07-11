import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextImage.css";

export default class TextImage extends Component {

  render() {
    
    const {t, id, htmlcontent1} = this.props;

    return (
      <div id="ti_container">
        <div id="ti_text-container" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div id="ti_img-container"><img src={`/slide_images/${id}.jpg`} /></div>
        <div className="clear" />
      </div>
    );
  }
}
