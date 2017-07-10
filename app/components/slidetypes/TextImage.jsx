import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextImage.css";

export default class TextImage extends Component {

  render() {
    
    const {t, id, htmlcontent} = this.props;

    return (
      <div className="ti_container">
        <div className="ti_textcontainer" dangerouslySetInnerHTML={{__html: htmlcontent}} />
        <div className="ti_imgcontainer"><img src={`/slide_images/${id}.jpg`} /></div>
        <div className="clear" />
      </div>
    );
  }
}
