import React, {Component} from "react";
import {connect} from "react-redux";
import {isAuthenticated} from "datawheel-canon";

import "./App.css";

import Splash from "./Splash";

class App extends Component {

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {

    const {children, auth} = this.props;

    return (
      <div>
        { auth.user ? children : auth.error ? <Splash /> : "Please Wait" }
      </div>
    );

  }
}

const mapDispatchToProps = dispatch => ({
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(state => ({auth: state.auth}), mapDispatchToProps)(App);
