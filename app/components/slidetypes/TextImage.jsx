import React, {Component} from "react";

export default class TextImage extends Component {

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

    return (
      <div id="slide-container" className="textImage flex-row">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        <div className="slide-image" style={{backgroundImage: `url('/slide_images/${ id }.jpg')`}}></div>
      </div>
    );
  }
}
