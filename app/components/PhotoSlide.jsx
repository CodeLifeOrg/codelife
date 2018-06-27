import React, {Component} from "react";
import "./PhotoSlide.css";

/**
 * Slideshow of images for About page
 */

export default class About extends Component {

  render() {

    const {location, name, photos, slug} = this.props;

    let body = null;
    if (photos.length === 5) {
      body = <div className="photo-group">
        <div style={{backgroundImage: `url('/photos/${ slug }/${ photos[0] }.jpg')`}} className="img half" />
        <div className="half">
          { photos.slice(1).map(p => <img src={ `/photos/${ slug }/${ p }.jpg` } className="half" />) }
        </div>
      </div>;
    }
    else if (photos.length === 2) {
      body = <div className="photo-group">
        <div style={{backgroundImage: `url('/photos/${ slug }/${ photos[0] }.jpg')`}} className="img half" />
        <div style={{backgroundImage: `url('/photos/${ slug }/${ photos[1] }.jpg')`}} className="img half" />
      </div>;
    }
    else if (photos.length === 1) {
      body = <div className="photo-group">
        <div style={{backgroundImage: `url('/photos/${ slug }/${ photos[0] }.jpg')`}} className="img" />
      </div>;
    }

    return (
      <div className="photoSlide">
        { body }
        <div className="school-name">{ name }</div>
        <div className="location-name">{ location }</div>
      </div>
    );
  }

}
