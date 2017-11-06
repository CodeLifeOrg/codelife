import React, {Component} from "react";

export default class CheatSheet extends Component {

  render() {

    const {htmlcontent1} = this.props;

    return (
      <div id="slide-container" className="cheatSheet flex-row">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
      </div>
    );
  }
}
