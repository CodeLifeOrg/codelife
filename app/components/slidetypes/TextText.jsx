import React, {Component} from "react";

export default class TextText extends Component {

  render() {
    const {htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="slide-content" className="slide-content textImage flex-row">
        <div className="slide-text wide" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
        { htmlcontent2 ? <div className="slide-text wide" dangerouslySetInnerHTML={{__html: htmlcontent2}} /> : null }
      </div>
    );
  }
}
