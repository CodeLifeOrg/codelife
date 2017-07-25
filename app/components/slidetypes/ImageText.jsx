import React, {Component} from "react";

export default class ImageText extends Component {

  render() {

    const {id, htmlcontent1} = this.props;

    return (
      <div id="slide-container" className="imageText flex-row">
        <div className="slide-image"><img src={ `/slide_images/${id}.jpg` } /></div>
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
      </div>
    );
  }
}
