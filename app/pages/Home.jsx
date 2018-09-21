import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import axios from "axios";
import CTA from "components/CTA";
import LoadingSpinner from "components/LoadingSpinner";

import "./Home.css";
import HomeLearn from "./home/HomeLearn";
import HomeHeaderLoggedOut from "./home/HomeHeaderLoggedOut";
import HomeHeaderLoggedIn from "./home/HomeHeaderLoggedIn";
import HomeFeatures from "./home/HomeFeatures";
import HomeCards from "./home/HomeCards";
import HomeAbout from "./home/HomeAbout";

/**
 * Homepage component - mostly a wrapper for other smaller components (cards, features, etc)
 */

class Home extends Component {

  constructor() {
    super();
    this.state = {
      codeBlocks: false,
      current: false,
      progress: [],
      projects: false,
      dbLoaded: false
    };
  }

  /** 
   * On mount, fetch the users progress so that a "continue your adventure" placard can be shown.
   * Whether the user is logged or not, fetch the featured cb/projects
   */
  componentDidMount() {
    const {user} = this.props;
    if (user) {
      axios.get("/api/userprogress/mine")
        .then(resp => {
          const {current, progress} = resp.data;
          this.setState({current, progress, dbLoaded: true});
        });
    }
    const codeBlocks = axios.get("/api/codeBlocks/featured");
    const projects = axios.get("/api/projects/featured");
    Promise.all([codeBlocks, projects])
      .then(resp => this.setState({
        codeBlocks: resp[0].data,
        projects: resp[1].data
      }));
  }

  render() {

    const {islands, locale, user} = this.props;
    const {codeBlocks, current, dbLoaded, progress, projects} = this.state;

    let loggedOut = true;
    this.props.user ? loggedOut = false : null;

    if (user && !dbLoaded) return <LoadingSpinner />;

    return (
      <div className="content home">

        {/* display appropriate splash component */}
        { loggedOut ? <HomeHeaderLoggedOut /> : <HomeHeaderLoggedIn current={current} progress={progress} /> }

        {/* what you'll learn (if logged out) */}
        { loggedOut && <HomeLearn /> }

        {/* 3 features (if logged out) */}
        { loggedOut && <HomeFeatures /> }

        {/* projects & codeblocks */}
        <HomeCards codeBlocks={codeBlocks} projects={projects} islands={islands} loggedOut={loggedOut} />

        {/* about text & video */}
        <HomeAbout locale={locale} />

        {/* call to action (if logged out) */}
        { loggedOut && <CTA context="home" /> }

      </div>
    );
  }
}

const mapStateToProps = state => ({
  locale: state.i18n.locale,
  user: state.auth.user,
  auth: state.auth,
  islands: state.islands
});

Home = connect(mapStateToProps)(Home);
export default translate()(Home);
