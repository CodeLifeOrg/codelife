import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import SelectSchool from "components/SelectSchool";
import "./Checkpoint.css";

class Checkpoint extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sid: null
    };
  }

  setSid(sid) {
    this.setState({sid});
    if (this.props.completed) this.props.completed(sid);
  }

  render() {

    const {t} = this.props;
    const {sid} = this.state;

    return (
      <SelectSchool sid={sid} callback={this.setSid.bind(this)} />
    );
  }
}

Checkpoint = connect(state => ({
  auth: state.auth
}))(Checkpoint);
Checkpoint = translate()(Checkpoint);
export default Checkpoint;
