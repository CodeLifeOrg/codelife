import React, {Component} from "react";

export default class TextImage extends Component {

  render() {

    const {id, htmlcontent1} = this.props;

    return (
      <div id="slide-container" className="textImage flex-row">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div className="slide-image" style={{backgroundImage: `url('/slide_images/${ id }.jpg')`}}></div>
      </div>
    );
  }
}
