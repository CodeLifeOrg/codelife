import React, {Component} from "react";
import {translate} from "react-i18next";
import "./ContestSubmit.css";

class ContestSubmit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  render() {
    // const {t} = this.props;

    return (
      <div id="contest-submit-container">
        submit things
      </div>
    );
  }
}

export default translate()(ContestSubmit);
