import React, {Component} from "react";
import {translate} from "react-i18next";
import "./TextImage.css";

export default class TextImage extends Component {

  render() {
    
    const {t, htmlcontent, imgblob} = this.props;

    return (
      <div>
        <p>{htmlcontent}</p>
        <img src={`data:image/png;base64, ${imgblob}`} />
      </div>
    );
  }
}
