import React, {Component} from "react";
import {connect} from "react-redux";
import {isAuthenticated} from "datawheel-canon";
import Helmet from "react-helmet";

import header from "../helmet.js";

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

    const {auth, children, i18n, location} = this.props;

    const routes = location.pathname.split("/");

    const bareRoute = routes[1] === "share";

    const meta = header.meta.slice();
    if (i18n.locale === "en") {
      meta.find(d => d.property === "og:image").content = "https://codelife.com/social/codelife-share-en.jpg";
      meta.find(d => d.property === "og:description").content = "Code School Brazil is a free online resource for high school students in Brazil to learn skills relevant to work in Brazil’s IT sector.";
    }

    return (
      <div id="app">
        <Helmet title={ header.title } link={ header.link } meta={ meta } />
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

export default connect(state => ({auth: state.auth, i18n: state.i18n}), mapDispatchToProps)(App);
