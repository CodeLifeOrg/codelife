import React, {Component} from "react";
import {Intent, Spinner} from "@blueprintjs/core";

import "./Loading.css";

export default class Loading extends Component {

  render() {

    return (
      <div id="loading">
        <Spinner intent={Intent.WARNING} />
        <h1 className="title">Loading...</h1>
      </div>
    );

  }

}
