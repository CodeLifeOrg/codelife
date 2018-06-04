import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {translate} from "react-i18next";
import axios from "axios";
import IslandLink from "components/IslandLink";
import AuthForm from "components/AuthForm";
import CTA from "components/CTA";
import {Dialog, Intent, Spinner} from "@blueprintjs/core";
import LoadingSpinner from "components/LoadingSpinner";

import "./Home.css";
import HomeLearn from "./home/HomeLearn";
import HomeFeatures from "./home/HomeFeatures";
import HomeCards from "./home/HomeCards";
import HomeAbout from "./home/HomeAbout";

class Home extends Component {

  constructor() {
    super();
    this.state = {
      codeBlocks: false,
      current: false,
      progress: [],
      projects: false,
      isauthForm: false,
      dbLoaded: false,
      formMode: "login"
    };
  }

  authForm(mode) {
    this.setState({formMode: mode, isauthForm: !this.state.isauthForm});
  }

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

    const {locale, t, islands, user} = this.props;
    const {codeBlocks, current, isauthForm, progress, projects, dbLoaded} = this.state;

    const videos = {
      en: "3s2vPV-tRhI",
      pt: "9ImSvqDDQuc"
    };

    if (user && !dbLoaded) return <LoadingSpinner />;

    return (
      <div className="content home">

        {/* header */}
        { !current
          ? <div className="header home-header logged-out-home-header u-text-center">

            {/* headline/signup/login */}
            <div className="header-inner">

              {/* headline */}
              <h1 className="intro-headline u-margin-bottom-off font-xxl">{ t("Home.Headline")}</h1>
              <p className="intro-text font-lg">{ t("Home.IntroText")}</p>

              {/* buttons */}
              <div className="authform-button-group u-margin-bottom-off">
                <button className="authform-button button inverted-button font-md" onClick={this.authForm.bind(this, "login")}>
                  <span className="pt-icon pt-icon-log-in" />
                  {t("LogIn.Log_in")}
                </button>
                <button className="authform-button button inverted-button font-md" onClick={this.authForm.bind(this, "signup")}>
                  <span className="pt-icon pt-icon-new-person" />
                  { t("Sign Up")}
                </button>
              </div>
            </div>
          </div>

          // logged in
          : <div className="header home-header logged-in-home-header u-text-center">
            <div className="header-inner header-half-container">

              {/* text */}
              <h1 className="header-headline font-xxl">
                { progress.length ? t("Home.ContinueAdventure") : t("Home.BeginAdventure") }
              </h1>

              {/* island */}
              <IslandLink key={current.id} island={current} heading={false} />

            </div>
          </div>
        }

        {/* what you'll learn */}
        { !current && <HomeLearn /> }

        {/* 3 features */}
        { !current && <HomeFeatures /> }

        {/* projects & codeblocks */}
        <HomeCards codeBlocks={codeBlocks} projects={projects} islands={islands} />

        {/* about text & video */}
        <HomeAbout videos={videos} locale={locale} />

        {/* display CTA if logged out */}
        { !this.props.user ? <CTA context="home" /> : null }

        {/* Authform */}
        <Dialog
          className="form-container"
          iconName="inbox"
          isOpen={isauthForm}
          onClose={this.authForm.bind(this)}
          title="Dialog header"
        >
          <AuthForm initialMode={this.state.formMode}/>
        </Dialog>
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
