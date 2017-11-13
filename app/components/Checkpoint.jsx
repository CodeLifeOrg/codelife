import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Button, RadioGroup, Radio, Toaster, Position, Intent} from "@blueprintjs/core";
import "./Checkpoint.css";

class Checkpoint extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    
  }

  render() {

    const {t} = this.props;
    const {mounted} = this.state;

    return (
      <div>hello</div>
    );
  }
}

Checkpoint = connect(state => ({
  auth: state.auth
}))(Checkpoint);
Checkpoint = translate()(Checkpoint);
export default Checkpoint;
