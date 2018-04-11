import React, {Component} from "react";
import {connect} from "react-redux";
import {isAuthenticated} from "datawheel-canon";
import PropTypes from "prop-types";
import Helmet from "react-helmet";

import header from "./helmet.js";

import "./App.css";
import "./Islands.css";

import Clouds from "components/Clouds";
import Footer from "components/Footer";
import Nav from "components/Nav";
import Loading from "components/Loading";

import axios from "axios";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {userInit: false};
  }

  componentWillMount() {
    this.props.isAuthenticated();
  }

  getChildContext() {
    return {browserHistory: this.props.router};
  }

  componentDidUpdate(prevProps) {
    const {auth} = this.props;
    const {userInit} = this.state;
    if (!userInit && auth.loading) this.setState({userInit: true});
    if (!prevProps.auth.user && this.props.auth.user) {
      axios.get("/api/profileping").then(() => {
        // No op.  On Mounting the app, we need to create a blank user in userprofiles that associates
        // with the user in canon's users.  This calls findOrCreate to make that happen.
      });
    }
  }

  componentDidMount() {
    const iget = axios.get("/api/islands/all");
    const lget = axios.get("/api/levels/all");
    const gget = axios.get("/api/glossary/all");

    Promise.all([iget, lget, gget]).then(resp => {
      const islands = resp[0].data;
      const levels = resp[1].data;
      const glossary = resp[2].data;
      this.props.dispatch({type: "LOAD_ISLANDS", payload: islands});
      this.props.dispatch({type: "LOAD_LEVELS", payload: levels});
      this.props.dispatch({type: "LOAD_GLOSSARY", payload: glossary});
    });
  }

  render() {
    const {auth, children, i18n, location, islands} = this.props;
    const {userInit} = this.state;

    const routes = this.props.router.location.pathname.split("/");

    const authRoute = routes[0] === "login";
    const bareRoute = ["projects", "codeBlocks"].includes(routes[0]) && routes.length === 3;

    const meta = header.meta.slice();

    if (i18n.locale === "en" || i18n.locale === "en-US") {
      meta.find(d => d.property === "og:image").content = "https://codelife.com/social/codelife-share-en.jpg";
      meta.find(d => d.property === "og:description").content = "Code School Brazil is a free online resource for high school students in Brazil to learn skills relevant to work in Brazil’s IT sector.";
      meta.find(d => d.name === "description").content = "Code School Brazil is a free online resource for high school students in Brazil to learn skills relevant to work in Brazil’s IT sector.";
    }
    meta.push({property: "og:locale", content: i18n.locale});

    let theme = "";
    const lookup = routes[0] === "island" && routes.length > 1 ? routes[1] : false;
    const currentIsland = islands.find(island => island.id === lookup);
    if (currentIsland) theme = currentIsland.theme;

    const reduxLoaded = Boolean(this.props.islands.length && this.props.levels.length && this.props.glossary.length);

    return (
      <div id="app">
        <Helmet title={ header.title } link={ header.link } meta={ meta } />
        {
          location.href.includes("dev.")
            ? <div className="devbar">Development Server. Do not edit content here!</div>
            : null
        }
        { reduxLoaded && userInit && !auth.loading || authRoute
          ? bareRoute
            ? children
            : <div className="container">
              <Clouds />
              <Nav currentPath={location.pathname} linkObj={this.props.params} isHome={ !this.props.router.location.pathname.includes("login") && this.props.router.location.pathname !== "/" } />
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

App.childContextTypes = {
  browserHistory: PropTypes.object
};

const mapStateToProps = state => ({
  auth: state.auth,
  i18n: state.i18n,
  location: state.location,
  islands: state.islands,
  levels: state.levels,
  glossary: state.glossary
});

const mapDispatchToProps = dispatch => ({
  dispatch: action => dispatch(action),
  isAuthenticated: () => {
    dispatch(isAuthenticated());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
