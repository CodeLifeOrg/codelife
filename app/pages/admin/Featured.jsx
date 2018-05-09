import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

import "./Featured.css";

class Featured extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    
  }

  render() {

    const {mounted} = this.state;

    return (
      <div id="featured content">
        Featured Selector
      </div>
    );
  }
}

Featured = connect(state => ({
  auth: state.auth
}))(Featured);
Featured = translate()(Featured);
export default Featured;
