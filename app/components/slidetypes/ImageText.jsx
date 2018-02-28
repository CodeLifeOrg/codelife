import React, {Component} from "react";

export default class ImageText extends Component {

  render() {

    const {id, htmlcontent1} = this.props;

    return (
      <div id="slide-content" className="slide-content imageText flex-row">
        <img src={`/slide_images/${ id }.jpg`} alt="" className="slide-image"/>
        {/* <div className="slide-image" style={{backgroundImage: `url('/slide_images/${ id }.jpg')`}}></div> */}
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
      </div>
    );
  }
}
