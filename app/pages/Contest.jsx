import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import AuthForm from "components/AuthForm";
import ContestSignup from "components/ContestSignup";
import ContestSubmit from "components/ContestSubmit";
import {Dialog} from "@blueprintjs/core";
import {browserHistory, Link} from "react-router";
import axios from "axios";

import "./Contest.css";

class Contest extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      signedUp: false,
      beatenGame: false,
      hasProjects: false,
      hasSubmitted: false,
      isAuthOpen: false,
      isSignupOpen: false,
      isSubmitOpen: false,
      formMode: "signup"
    };
  }

  componentDidMount() {
    if (this.props.user) {
      const islands = this.props.islands.map(i => Object.assign({}, i)).sort((a, b) => a.ordering - b.ordering);
      const levels = this.props.levels.map(l => Object.assign({}, l));
      let flatProgress = [];
      for (const i of islands) {
        // This filters out non-yet released islands
        // TODO: Longer term solution for active/inactive islands
        if (!["island-21a4", "island-bacb"].includes(i.id)) {
          const myLevels = levels.filter(l => l.lid === i.id).sort((a, b) => a.ordering - b.ordering);
          flatProgress = flatProgress.concat(myLevels, i);
        }
      }
      const cget = axios.get("/api/contest/status");
      const upget = axios.get("/api/userprogress/mine");
      const pget = axios.get("/api/projects/mine");
      Promise.all([cget, upget, pget]).then(resp => {
        const status = resp[0].data;
        const progress = resp[1].data.progress;
        const projects = resp[2].data;
        const trueProgress = progress.filter(up => up.status === "completed");
        const signedUp = Boolean(status && status.eligible === 1);
        const beatenGame = trueProgress.length >= flatProgress.length || this.props.user.role >= 1;
        const hasProjects = projects.length > 0;
        const hasSubmitted = status && status.project_id !== null;
        this.setState({signedUp, beatenGame, hasProjects, hasSubmitted});
      });
    }
  }

  determineStep() {
    const hasAccount = Boolean(this.props.user);
    const {signedUp, beatenGame, hasProjects, hasSubmitted} = this.state;

    if (!hasAccount) return 1;
    if (hasAccount && !signedUp) return 2;
    if (hasAccount && signedUp && !beatenGame) return 3;
    if (hasAccount && signedUp && beatenGame && !hasProjects) return 4;
    if (hasAccount && signedUp && beatenGame && hasProjects && !hasSubmitted) return 5;
    // Step "6" means they have submitted a project but want to resubmit (overwrite)
    if (hasAccount && signedUp && beatenGame && hasProjects && hasSubmitted) return 6;
    return 0;
  }

  onSignup() {
    this.setState({signedUp: true, isSignupOpen: false});
  }

  onSubmit() {
    this.setState({hasSubmitted: true, isSubmitOpen: false});
  }

  render() {

    const {t} = this.props;

    const hasAccount = Boolean(this.props.user);
    const {signedUp, beatenGame, hasProjects, hasSubmitted} = this.state;

    // set projects link if user is logged in
    let projectsLink = "/projects";
    hasAccount ? projectsLink = `/projects/${this.props.user.username}` : null;

    return (
      <div className="content contest u-padding-top-off">

        {/* header */}
        <header className="header contest-header">
          <div className="header-inner">
            {/* headline + subhead */}
            <div className="header-text">
              <h1 className="header-headline font-xxl u-margin-top-off u-margin-bottom-off">{ t("Contest.Headline")}</h1>
              <p className="header-subhead heading font-lg u-margin-bottom-off">{ t("Contest.Subhead")}</p>
            </div>
            {/* timeline */}
            <div className="header-sidebar contest-timeline">
              <h2 className="contest-timeline-heading font-md u-margin-top-off">{t("Contest.TimelineHeading")}</h2>
              <dl className="contest-timeline-list">
                <dt className="contest-timeline-term heading u-margin-bottom-off font-sm">{t("Contest.OpensLabel")}</dt>
                <dd className="contest-timeline-definition font-xs">{t("Contest.OpensDate")}</dd>
                <dt className="contest-timeline-term heading u-margin-bottom-off font-sm">{t("Contest.CompetitionLabel")}</dt>
                <dd className="contest-timeline-definition font-xs">{t("Contest.CompetitionDate")}</dd>
                <dt className="contest-timeline-term heading u-margin-bottom-off font-sm">{t("Contest.JudgingLabel")}</dt>
                <dd className="contest-timeline-definition font-xs">{t("Contest.JudgingDate")}</dd>
                <dt className="contest-timeline-term heading u-margin-bottom-off font-sm">{t("Contest.WinnersAnnouncedLabel")}</dt>
                <dd className="contest-timeline-definition font-xs">{t("Contest.WinnersAnnouncedDate")}</dd>
                <dt className="contest-timeline-term heading u-margin-bottom-off font-sm">{t("Contest.AwardCeremonyLabel")}</dt>
                <dd className="contest-timeline-definition font-xs">{t("Contest.AwardCeremonyDate")}</dd>
              </dl>
            </div>
          </div>
        </header>

        {/* checklist */}
        <div className="fullwidth-container">
          <div className="content font-md">

            {/* section heading */}
            <h2 className="font-xl u-margin-top-off">{t("Contest.StepsHeading")}</h2>


            {/* STEP 1 - Create account */}
            <div className={ this.determineStep() === 1 ? "contest-step is-current-step" : "contest-step" }>
              {/* status */}
              <span className={ !hasAccount
                ? "heading font-xl contest-step-status is-unticked"
                : "heading font-xl contest-step-status is-ticked"
              }>
                { hasAccount ? <span className="contest-step-tick pt-icon pt-icon-small-tick" /> : null }
                <span className="contest-step-number">1</span>
              </span>
              {/* content container */}
              <div className="contest-step-content">
                {/* heading */}
                <h3 className="font-lg u-margin-bottom-off">
                  {t("Contest.CreateAccountHeading")}
                </h3>
                {/* text */}
                { !hasAccount
                  ? <p className="u-margin-top-off u-margin-bottom-off">{t("Contest.CreateAccountText")}</p>
                  : null
                }
                {/* actions - hidden by default */}
                <p className="contest-step-action">
                  {/* sign up */}
                  <button onClick={() => this.setState({isAuthOpen: true, formMode: "signup"})} className="contest-step-button pt-button pt-intent-primary">{t("SignUp.Create account")}</button>
                  {/* or */}
                  <span className="contest-button-or font-sm u-hide-below-sm"> {t("or")} </span>
                  {/* log in */}
                  <button onClick={() => this.setState({isAuthOpen: true, formMode: "login"})} className="contest-step-button pt-button pt-intent-primary">
                    <span className="pt-icon-standard pt-icon-log-in" />
                    { t("LogIn.Log_in") }
                  </button>
                </p>
              </div>
            </div>


            {/* STEP 2 - Sign up for contest */}
            <div className={ this.determineStep() === 2 ? "contest-step is-current-step" : "contest-step" }>
              {/* status */}
              <span className={ !signedUp
                ? "heading font-xl contest-step-status is-unticked"
                : "heading font-xl contest-step-status is-ticked"
              }>
                { signedUp ? <span className="contest-step-tick pt-icon pt-icon-small-tick" /> : null }
                <span className="contest-step-number">2</span>
              </span>
              {/* content container */}
              <div className="contest-step-content">
                {/* heading */}
                <h3 className="font-lg u-margin-bottom-off">
                  {t("Contest.SignupHeading")}
                </h3>
                {/* text */}
                { !signedUp
                  ? <p className="u-margin-top-off u-margin-bottom-off">{t("Contest.SignupText")}</p>
                  : null
                }
                {/* actions - hidden by default */}
                <p className="contest-step-action">
                  {/* contest sign up */}
                  <button onClick={() => this.setState({isSignupOpen: true})} className="contest-step-button pt-button pt-intent-primary">{t("Contest.SignupButton")}</button>
                </p>
              </div>
            </div>


            {/* STEP 3 - Learn to code */}
            <div className={ this.determineStep() === 3 ? "contest-step is-current-step" : "contest-step" }>
              {/* status */}
              <span className={ !beatenGame
                ? "heading font-xl contest-step-status is-unticked"
                : "heading font-xl contest-step-status is-ticked"
              }>
                { beatenGame ? <span className="contest-step-tick pt-icon pt-icon-small-tick" /> : null }
                <span className="contest-step-number">3</span>
              </span>
              {/* content container */}
              <div className="contest-step-content">
                {/* heading */}
                <h3 className="font-lg u-margin-bottom-off">
                  {t("Contest.LearnToCodeHeading")}
                </h3>
                {/* text */}
                { !beatenGame
                  ? <p className="u-margin-top-off u-margin-bottom-off">{t("Contest.LearnToCodeText")}</p>
                  : null
                }
                {/* actions - hidden by default */}
                <p className="contest-step-action">
                  {/* go to island */}
                  <Link to="/island" className="contest-step-button pt-button pt-intent-primary">{t("Contest.LearnToCodeButton")}</Link>
                </p>
              </div>
            </div>


            {/* STEP 4 - Build a website */}
            <div className={ this.determineStep() === 4 ? "contest-step is-current-step" : "contest-step" }>
              {/* status */}
              <span className={ !hasProjects
                ? "heading font-xl contest-step-status is-unticked"
                : "heading font-xl contest-step-status is-ticked"
              }>
                { hasProjects ? <span className="contest-step-tick pt-icon pt-icon-small-tick" /> : null }
                <span className="contest-step-number">4</span>
              </span>
              {/* content container */}
              <div className="contest-step-content">
                {/* heading */}
                <h3 className="font-lg u-margin-bottom-off">
                  {t("Contest.BuildAWebsiteHeading")}
                </h3>
                {/* text */}
                { !hasProjects
                  ? <p className="u-margin-top-off u-margin-bottom-off">{t("Contest.BuildAWebsiteText")}</p>
                  : null
                }
                {/* actions - hidden by default */}
                <p className="contest-step-action">
                  {/* go to projects */}
                  <Link to={projectsLink} className="contest-step-button pt-button pt-intent-primary">{t("Contest.BuildAWebsiteButton")}</Link>
                </p>
              </div>
            </div>


            {/* STEP 5 - Submit project */}
            <div className={ this.determineStep() === 5 || this.determineStep() === 6 ? "contest-step is-current-step" : "contest-step" }>
              {/* status */}
              <span className={ !hasSubmitted
                ? "heading font-xl contest-step-status is-unticked"
                : "heading font-xl contest-step-status is-ticked"
              }>
                { hasSubmitted ? <span className="contest-step-tick pt-icon pt-icon-small-tick" /> : null }
                <span className="contest-step-number">5</span>
              </span>
              {/* content container */}
              <div className="contest-step-content">
                {/* heading */}
                <h3 className="font-lg u-margin-bottom-off">
                  {t("Contest.SubmitHeading")}
                </h3>
                {/* text */}
                { !hasSubmitted
                  ? <p className="u-margin-top-off u-margin-bottom-off">{t("Contest.SubmitText")}</p>
                  : null
                }
                {/* actions - hidden by default */}
                <p className="contest-step-action">
                  {/* submit project / manage submission */}
                  <button onClick={() => this.setState({isSubmitOpen: true})} className="contest-step-button pt-button pt-intent-primary">
                    { this.determineStep() === 5 ? t("Contest.SubmitButton") : t("Contest.SubmitButtonManage")}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Dialog
          className="form-container"
          isOpen={this.state.isAuthOpen}
          onClose={() => this.setState({isAuthOpen: false})}
          title="">
          <AuthForm initialMode={this.state.formMode} />
        </Dialog>

        <Dialog
          className="form-container"
          isOpen={this.state.isSignupOpen}
          onClose={() => this.setState({isSignupOpen: false})}
          title="">
          <ContestSignup onSignup={this.onSignup.bind(this)}/>
        </Dialog>

        <Dialog
          className="form-container"
          isOpen={this.state.isSubmitOpen}
          onClose={() => this.setState({isSubmitOpen: false})}
          title="">
          <ContestSubmit onSubmit={this.onSubmit.bind(this)}/>
        </Dialog>

      </div>
    );
  }
}

Contest = connect(state => ({
  user: state.auth.user,
  islands: state.islands,
  levels: state.levels
}))(Contest);
Contest = translate()(Contest);
export default Contest;
