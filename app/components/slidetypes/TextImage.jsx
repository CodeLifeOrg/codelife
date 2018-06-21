import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

/**
 * TextImage is text left, image right. Images are stored in /slide_images/{id}.jpg
 * Images are uploaded through the CMS and a translated version is chosen here via locales
 */

class TextImage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      slideId: null
    };
  }

  componentDidMount() {
    this.setState({slideId: this.props.id});
  }
  
  componentDidUpdate() {
    if (this.state.slideId !== this.props.id) {
      this.setState({slideId: this.props.id});
    }
  }

  render() {

    const {id, htmlcontent1} = this.props;

    let path = `/slide_images/${ id }.jpg?v=${new Date().getTime()}`;
    // Use locale to change the path to pt if necessary. OverrideLang is used in the CMS
    // where the locale may be en, but we want to show the pt version manually.
    if (this.props.locale === "pt" || this.props.overrideLang === "pt") path = `/slide_images/pt_${ id }.jpg?v=${new Date().getTime()}`;

    return (
      <div id="slide-content" className="slide-content textImage flex-row">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        {/* <div className="slide-image" style={{backgroundImage: `url('/slide_images/${ id }.jpg')`}}></div> */}
        <div className="slide-image-container">
          <img src={path} alt="" className="slide-image"/>
        </div>
      </div>
    );
  }
}

TextImage = connect(state => ({
  auth: state.auth,
  locale: state.i18n.locale
}))(TextImage);
TextImage = translate()(TextImage);
export default TextImage;
