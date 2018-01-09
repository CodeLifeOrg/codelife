import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {browserHistory} from "react-router";
import {translate} from "react-i18next";
import {Alert, Intent, Position, Toaster, Popover, Button, PopoverInteractionKind} from "@blueprintjs/core";
import "./Discussion.css";

import Loading from "components/Loading";

class Discussion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }


  render() {

    if (!this.state.mounted) return <Loading />;

    return (
      <div id="discussion">
        discussion
      </div>
    );
  }
}

Discussion = connect(state => ({
  auth: state.auth
}))(Discussion);
Discussion = translate()(Discussion);
export default Discussion;
