import React, {Component} from "react";

export default class TextText extends Component {

  componentDidMount() {
    if (this.props.updateGems) this.props.updateGems(1);
  }

  render() {
    const {htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="slide-container" className="textImage flex-row">
        <div className="slide-text wide" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        { htmlcontent2 ? <div className="slide-text wide" dangerouslySetInnerHTML={{__html: htmlcontent2}} /> : null }
      </div>
    );
  }
}
