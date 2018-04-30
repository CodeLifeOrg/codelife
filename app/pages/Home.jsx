import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {translate} from "react-i18next";
import axios from "axios";
import CodeBlockCard from "components/CodeBlockCard";
import ProjectCard from "components/ProjectCard";
import IslandLink from "components/IslandLink";
import AuthForm from "components/AuthForm";
import CTA from "components/CTA";
import {Dialog, Intent, Spinner} from "@blueprintjs/core";
import "./Home.css";

class Home extends Component {

  constructor() {
    super();
    this.state = {
      codeBlocks: false,
      current: false,
      progress: [],
      projects: false,
      isauthForm: false,
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
          this.setState({current, progress});
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

    const {locale, t, islands} = this.props;
    const {codeBlocks, current, isauthForm, progress, projects} = this.state;

    const videos = {
      en: "3s2vPV-tRhI",
      pt: "9ImSvqDDQuc"
    };

    return (
      <div className="content home">

        {/* header */}
        { !current
          ? <div className="header home-header logged-out-home-header u-text-center">
            <div className="header-inner header-half-container">

              {/* headline/signup/login */}
              <div className="header-half">

                {/* headline */}
                <h1 className="intro-headline u-margin-bottom-off">{ t("Home.Headline")}</h1>
                {/* <p className="intro-text font-lg">{ t("Home.IntroText")}</p> */}

                {/* buttons */}
                <div className="authform-button-group u-margin-bottom-off">
                  <button className="authform-button pt-button pt-intent-primary font-md" onClick={this.authForm.bind(this, "signup")}>
                    { t("Home.GetStarted")}
                  </button>
                  <button className="authform-button pt-button pt-intent-primary font-md" onClick={this.authForm.bind(this, "login")}>
                    <span className="pt-icon pt-icon-log-in" />
                    {t("LogIn.Log_in")}
                  </button>
                </div>
              </div>

              {/* video */}
              <div className="header-half">
                {/* container needed to make it responsive */}
                <div className="video-container">
                  <iframe className="video-iframe"
                    src={ `https://www.youtube-nocookie.com/embed/${ videos[locale] || videos.en }?rel=0` }
                    frameBorder="0"
                    allowFullScreen />
                </div>
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

        {/* mandatory 3 columns of features / selling points */}
        { !current
          ? <div className="content-section">
            <div className="feature-list u-list-reset">
              {/* feature 1 */}
              <p className="feature-item font-md">
                <span className="feature-icon pt-icon pt-icon-code" />
                <span className="feature-text">
                  {t("Home.Feature1")}
                </span>
              </p>
              {/* feature 2 */}
              <p className="feature-item font-md">
                <span className="feature-icon pt-icon pt-icon-eye-open" />
                <span className="feature-text">
                  {t("Home.Feature2")}
                </span>
              </p>
              {/* feature 3 */}
              <p className="feature-item font-md">
                <span className="feature-icon pt-icon pt-icon-send-to-map" />
                <span className="feature-text">
                  {t("Home.Feature3")}
                </span>
              </p>
            </div>
          </div>
          : null }

        {/* made on codelife */}
        <div className="content-section">

          {/* keep this a paragraph so that project and codeblock cards have the right heading level */}
          <p className="heading font-lg">{t("Home.MadeOnCodelife")}</p>

          {/* projects */}
          <div className="project-section">
            <h2 className="font-md">{ t("Featured Projects") }</h2>
            <div className="card-list project-list">
              { !projects ? <Spinner intent={Intent.PRIMARY}/> : projects.map(p => <ProjectCard key={p.id} project={p} />) }
            </div>
          </div>

          {/* codeblocks */}
          <div className="codeblock-section">
            <h2 className="font-md">{ t("Featured CodeBlocks") }</h2>
            <div className="card-list codeblock-list">
              { !codeBlocks ? <Spinner intent={Intent.PRIMARY}/> : codeBlocks.map(c => {
                const {theme, icon} = islands.find(i => i.id === c.lid);
                return <CodeBlockCard key={c.id} codeBlock={c} theme={theme} icon={icon} />;
              }) }
            </div>
          </div>
        </div>

        {/* what you'll learn */}
        <figure className="content-section learn-section">

          <div className="learn-figure">
            <img className="learn-img"
              src="/home/what-youll-learn.png"
              srcSet="/home/what-youll-learn.png 1x,
                      /home/what-youll-learn@2x.png 2x"
              alt=""/>
          </div>

          <figcaption className="learn-caption">
            <h2 className="learn-heading">{ t("Home.LearnHeading") }</h2>

            <ul className="learn-list font-md">
              <li className="learn-list-item">{ t("Home.LearnItem1") }</li>
              <li className="learn-list-item">{ t("Home.LearnItem2") }</li>
              <li className="learn-list-item">{ t("Home.LearnItem3") }</li>
              <li className="learn-list-item">{ t("Home.LearnItem4") }</li>
              <li className="learn-list-item">{ t("Home.LearnItem5") }</li>
            </ul>

            <button className="authform-button pt-button pt-intent-primary font-md" onClick={this.authForm.bind(this, "signup")}>
              { t("Home.GetStarted")}
            </button>
          </figcaption>
        </figure>

        {/* about blurb */}
        {/* <div className="about content-section limited-width">
          <h2>{ t("What is CodeLife?") }</h2>
          <p>{ t("splashP1") }</p>
          <p>{ t("splashP2") }</p>
          <p>{ t("splashP3") }</p>
          <p>{ t("splashP4") }</p>
        </div> */}

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
