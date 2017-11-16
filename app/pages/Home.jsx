import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {Login, SignUp} from "datawheel-canon";
import {Intent, Spinner} from "@blueprintjs/core";
import axios from "axios";
import CodeBlockCard from "components/CodeBlockCard";
import ProjectCard from "components/ProjectCard";
import "./Home.css";

class Home extends Component {

  constructor() {
    super();
    this.state = {
      codeBlocks: false,
      current: false,
      islands: false,
      progress: [],
      projects: false,
      signup: true
    };
  }

  toggleSignup() {
    this.setState({signup: !this.state.signup});
  }

  componentDidMount() {
    const {user} = this.props;
    if (user) {
      axios.get("/api/userprogress")
        .then(resp => {
          const {current, progress} = resp.data;
          this.setState({current, progress});
        });
    }
    const codeBlocks = axios.get("/api/codeBlocks/featured");
    const projects = axios.get("/api/projects/featured");
    const islands = axios.get("/api/islands");
    Promise.all([codeBlocks, projects, islands])
      .then(resp => this.setState({
        codeBlocks: resp[0].data,
        islands: resp[2].data,
        projects: resp[1].data
      }));
  }

  render() {

    const {t, user} = this.props;
    const {codeBlocks, current, islands, progress, projects, signup} = this.state;

    return (
      <div id="Home">
        <div id="island" className={ current ? current.theme : "island-jungle" }>
          <div className="image">
            <h1 className="title">{ user ? t("home.welcome", {name: user.name || user.username}) : t("home.tagline") }</h1>
            { current ? <Link to={ `/island/${current.id}` } className={ `pt-button pt-intent-primary pt-large ${current.icon}` }>{ t(progress.length ? t("home.continue", {island: current.name}) : t("home.start"), {island: current.name}) }</Link> : null }
            <div className="video">
              <div className="play">
                <span className="pt-icon-large pt-icon-play"></span>
                <div className="title">Welcome to CodeLife</div>
              </div>
            </div>
          </div>
        </div>
        { !user
          ? <div className="enter-container">
            <div className="avatar">
              <img src="/avatars/test-group.png" />
              <div className="prompt">{ t("home.prompt") }</div>
            </div>
            { signup
              ? <div className="form">
                <a className="callToAction" onClick={ this.toggleSignup.bind(this) }>{ t("Login.CallToAction") }</a>
                <SignUp />
              </div>
              : <div className="form">
                <Login />
                <a className="callToAction" onClick={ this.toggleSignup.bind(this) }>{ t("SignUp.CallToAction") }</a>
              </div>
            }
          </div>
          : null }
        <h2>{ t("Featured Projects") }</h2>
        <div className="projects">
          { !projects ? <Spinner intent={Intent.PRIMARY}/> : projects.map(p => <ProjectCard key={p.id} project={p} />) }
        </div>
        <h2>{ t("Featured CodeBlocks") }</h2>
        <div className="codeBlocks">
          { !codeBlocks ? <Spinner intent={Intent.PRIMARY}/> : codeBlocks.map(c => {
            const {theme, icon} = islands.find(i => i.id === c.lid);
            return <CodeBlockCard key={c.id} codeBlock={c} theme={theme} icon={icon} />;
          }) }
        </div>
      </div>
    );
  }
}

Home = connect(state => ({user: state.auth.user}))(Home);
export default translate()(Home);
