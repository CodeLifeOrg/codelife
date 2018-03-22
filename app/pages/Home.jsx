import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {translate} from "react-i18next";
import axios from "axios";
import CodeBlockCard from "components/CodeBlockCard";
import ProjectCard from "components/ProjectCard";
import AuthForm from "components/AuthForm";
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

        {/* OG intro */}
        <div className={ `island content-section ${current ? current.theme : "island-jungle"}` }>
          <div className="island-image image">
            <div className="logo">
              <div className="tag">Beta</div>
              <img className="text" src="/logo/logo-shadow.png" />
            </div>
            { current
              ? <Link to={ `/island/${current.id}` } className={ `pt-button pt-intent-primary pt-large ${current.icon}` }>{ progress.length ? t("home.continue", {island: current.name}) : t("home.start", {island: current.name}) }</Link>
              : <h2 className="title">{ t("home.tagline") }</h2> }
            <iframe className="video" src={ `https://www.youtube-nocookie.com/embed/${ videos[locale] || videos.en }?rel=0` } frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>

        {/* intro */}
        { !current
          ? <div className="intro content-section u-text-center">

            <h1 className="intro-headline">{ t("Home.Headline")}</h1>
            {/* <p className="intro-text font-lg">{ t("Home.IntroText")}</p> */}

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
          : null
        }

        {/* made on codelife */}
        <div className="content-section">

          <h2>{t("Home.MadeOnCodelife")}</h2>

          {/* projects */}
          <div className="project-section">
            <h3>{ t("Featured Projects") }</h3>
            <div className="project-list">
              { !projects ? <Spinner intent={Intent.PRIMARY}/> : projects.map(p => <ProjectCard key={p.id} project={p} />) }
            </div>
          </div>

          {/* codeblocks */}
          <div className="codeblock-section">
            <h3>{ t("Featured CodeBlocks") }</h3>
            <div className="codeblock-list">
              { !codeBlocks ? <Spinner intent={Intent.PRIMARY}/> : codeBlocks.map(c => {
                const {theme, icon} = islands.find(i => i.id === c.lid);
                return <CodeBlockCard key={c.id} codeBlock={c} theme={theme} icon={icon} />;
              }) }
            </div>
          </div>
        </div>

        {/* about blurb */}
        <div className="about content-section limited-width u-margin-auto">
          <h2>{ t("What is CodeLife?") }</h2>
          <p>{ t("splashP1") }</p>
          <p>{ t("splashP2") }</p>
          <p>{ t("splashP3") }</p>
          <p>{ t("splashP4") }</p>
        </div>

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
