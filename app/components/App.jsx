import React, {Component} from "react";
import {connect} from "react-redux";
import {isAuthenticated} from "datawheel-canon";

import "./App.css";

import Clouds from "./Clouds";
import Footer from "./Footer";
import Nav from "./Nav";
import Splash from "./Splash";

class App extends Component {

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {

    const {children, auth} = this.props;

    return (
      <div id="app">
        { auth.user
        ? <div className="container">
            <Clouds />
            <Nav />
            { children }
            <Footer />
          </div>
        : auth.error
        ? <Splash />
        : "Please Wait" }
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
