import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

class TextImage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      slideId: null
    };
  }

  componentDidMount() {
    if (this.props.updateGems) this.props.updateGems(1);
    this.setState({slideId: this.props.id});
  }

  componentDidUpdate() {
    if (this.state.slideId !== this.props.id) {
      if (this.props.updateGems) this.props.updateGems(1);
      this.setState({slideId: this.props.id});
    }
  }

  render() {

    const {id, htmlcontent1} = this.props;

    let path = `/slide_images/${ id }.jpg`;
    if (this.props.locale === "pt") path = `/slide_images/pt_${ id }.jpg`;

    return (
      <div id="slide-container" className="textImage flex-row">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div className="slide-image" style={{backgroundImage: `url(${path})`}}></div>
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
