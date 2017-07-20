import React, {Component} from "react";
import {connect} from "react-redux";
import {isAuthenticated} from "datawheel-canon";

import "./App.css";

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
      <div>
        { auth.user
        ? <div>
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
