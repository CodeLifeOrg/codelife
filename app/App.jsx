import React, {Component} from "react";
import {connect} from "react-redux";
import {isAuthenticated} from "datawheel-canon";
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

    const routes = location.pathname.split("/");

    const authRoute = routes[1] === "login";
    const bareRoute = ["projects", "codeBlocks"].includes(routes[1]) && routes.length === 4;

    const meta = header.meta.slice();

    if (i18n.locale === "en" || i18n.locale === "en-US") {
      meta.find(d => d.property === "og:image").content = "https://codelife.com/social/codelife-share-en.jpg";
      meta.find(d => d.property === "og:description").content = "Code School Brazil is a free online resource for high school students in Brazil to learn skills relevant to work in Brazil’s IT sector.";
      meta.find(d => d.name === "description").content = "Code School Brazil is a free online resource for high school students in Brazil to learn skills relevant to work in Brazil’s IT sector.";
    }
    meta.push({property: "og:locale", content: i18n.locale});

    let theme = "";
    const lookup = routes[1] === "island" && routes.length > 2 ? routes[2] : false;
    const currentIsland = islands.find(island => island.id === lookup);
    if (currentIsland) theme = currentIsland.theme;

    return (
      <div id="app">
        <Helmet title={ header.title } link={ header.link } meta={ meta } />
        { userInit && !auth.loading || authRoute
          ? bareRoute
            ? children
            : <div className="container">
              <Clouds />
              <Nav linkObj={this.props.params} logo={ !location.pathname.includes("login") && location.pathname !== "/" } />
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

const mapStateToProps = state => ({
  auth: state.auth,
  i18n: state.i18n,
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
