import React, {Component} from "react";
import {connect} from "react-redux";
import {isAuthenticated} from "datawheel-canon";

import "./App.css";
import "./Islands.css";

import Clouds from "./Clouds";
import Footer from "./Footer";
import Nav from "./Nav";
import Loading from "./Loading";

class App extends Component {

  componentWillMount() {
    this.props.isAuthenticated();
  }

  render() {

    const {auth, children, location} = this.props;

    const routes = location.pathname.split("/");

    const bareRoute = routes[1] === "share";

    return (
      <div id="app">
        { auth.user || auth.error
        ? bareRoute ? children
        : <div className="container">
            <Clouds />
            <Nav logo={ !location.pathname.includes("login") } />
            { children }
            <Footer className={ routes[1] === "lesson" && routes.length > 2 ? routes[2] : "" } />
          </div>
        : <div className="container">
            <Clouds />
            <Loading />
          </div> }
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
