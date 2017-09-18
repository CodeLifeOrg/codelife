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

import axios from "axios";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {userInit: false};
  }

  componentWillMount() {
    this.props.isAuthenticated();
  }

  componentDidUpdate() {
    const {auth} = this.props;
    const {userInit} = this.state;
    if (!userInit && auth.loading) this.setState({userInit: true});
  }

  componentDidMount() {
    axios.get("/api/lessons").then(resp => {
      const lessons = resp.data;
      console.log(lessons);
      this.props.dispatch({type: "LOAD_ISLANDS", payload: lessons});  
    });
  }

  render() {
    const {auth, children, i18n, location, islands} = this.props;
    const {userInit} = this.state;

    const routes = location.pathname.split("/");

    const authRoute = routes[1] === "login";
    const bareRoute = routes.includes("projects") && routes.length === 4;

    const meta = header.meta.slice();
    if (i18n.locale === "en") {
      meta.find(d => d.property === "og:image").content = "https://codelife.com/social/codelife-share-en.jpg";
      meta.find(d => d.property === "og:description").content = "Code School Brazil is a free online resource for high school students in Brazil to learn skills relevant to work in Brazil’s IT sector.";
    }

    let theme = "";
    const lookup = routes[1] === "lesson" && routes.length > 2 ? routes[2] : false;
    const currentIsland = islands.find(island => island.id === lookup);
    if (currentIsland) theme = currentIsland.theme;

    return (
      <div id="app">
        <Helmet title={ header.title } link={ header.link } meta={ meta } />
        { userInit && !auth.loading || authRoute
        ? bareRoute ? children
        : <div className="container">
            <Clouds />
            <Nav logo={ !location.pathname.includes("login") } />
            { children }
            <Footer currentPath={location.pathname} className={ theme } />
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
  dispatch: action => dispatch(action),
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(state => ({auth: state.auth, i18n: state.i18n, islands: state.islands}), mapDispatchToProps)(App);
