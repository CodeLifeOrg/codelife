import React, {Component} from "react";

/**
 * Cheatsheets are full-slide reference sheets of an entire island's content
 */

export default class CheatSheet extends Component {

  render() {

    const {htmlcontent1} = this.props;

    return (
      <div id="slide-content" className="slide-content cheatSheet flex-row">
        <div className="slide-text" dangerouslySetInnerHTML={{__html: htmlcontent1}} />
      </div>
    );
  }
}
