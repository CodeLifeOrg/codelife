import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import SelectSchool from "pages/profile/SelectSchool";
import {Button, RadioGroup, Radio, Toaster, Position, Intent} from "@blueprintjs/core";
import "./Checkpoint.css";

class Checkpoint extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      sid: null
    };
  }

  componentDidMount() {
    
  }

  setSid(sid) {
    this.setState({sid});
    if (this.props.completed) this.props.completed(sid);
  }

  render() {

    const {t} = this.props;
    const {sid} = this.state;

    return (
      <div className="pt-form-group pt-inline">
        <label className="pt-label" htmlFor="example-form-group-input-d">
          {t("What school do you go to?")}
        </label>
        <SelectSchool sid={sid} callback={this.setSid.bind(this)} />
      </div>
    );
  }
}

Checkpoint = connect(state => ({
  auth: state.auth
}))(Checkpoint);
Checkpoint = translate()(Checkpoint);
export default Checkpoint;
