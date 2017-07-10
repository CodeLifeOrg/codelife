import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextImage.css";

export default class TextImage extends Component {

  render() {
    
    const {t, id, htmlcontent} = this.props;

    return (
      <div className="container">
        <div className="textcontainer" dangerouslySetInnerHTML={{__html: htmlcontent}} />
        <div className="imgcontainer"><img src={`/slide_images/${id}.jpg`} /></div>
        <div className="clear" />
      </div>
    );
  }
}
