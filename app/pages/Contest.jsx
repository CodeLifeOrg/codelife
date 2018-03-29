import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import AuthForm from "components/AuthForm";
import ContestSignup from "components/ContestSignup";
import {Dialog} from "@blueprintjs/core";
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
      isSignupOpen: false
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
        const signedUp = status.eligible === 1;
        //const signedUp = false;
        const beatenGame = trueProgress.length >= flatProgress.length;
        const hasProjects = projects.length > 0;
        const hasSubmitted = status.project_id !== null;
        this.setState({signedUp, beatenGame, hasProjects, hasSubmitted});
      });
    }
  }

  render() {

    const {t} = this.props;

    const hasAccount = this.props.user;
    const {signedUp, beatenGame, hasProjects, hasSubmitted} = this.state;

    const good = <span className="pt-icon pt-icon-tick" style={{color: "green"}}/>;
    const bad = <span className="pt-icon pt-icon-cross" style={{color: "red"}}/>;

    return (
      <div className="content contest font-md">

        <h1>Welcome to the Codelife Contest</h1>

        <p>code with your friends and win prizes</p>

        <ul style={{border: "1px solid black"}}>
          <li>rules</li>
          <li>rules</li>
          <li>rules</li>
        </ul>

        <ul>
          <li>
            {hasAccount ? good : bad} create a codelife account<br/>
            {!hasAccount
              ? <div>
                <p>sign up for codelife explanation</p>
                <button onClick={() => this.setState({isAuthOpen: true})} className="pt-button pt-intent-primary font-md">Sign Up for CodeLife</button>
              </div>
              : null
            }
          </li>
          <li>
            {signedUp ? good : bad} sign up for the contest<br/>
            {hasAccount && !signedUp 
              ? <div>
                <p>sign up for the contest explanation</p>
                <button onClick={() => this.setState({isSignupOpen: true})} className="pt-button pt-intent-primary font-md">Sign Up for the Contest</button>
              </div>
              : null
            }
          </li>
          <li>
            {beatenGame ? good : bad} learn to code<br/>
            {hasAccount && signedUp && !beatenGame
              ? <div>
                <p>go beat all the islands</p>
                <button className="pt-button pt-intent-primary font-md">Play all the levels</button>
              </div>
              : null
            }
          </li>
          <li>
            {hasProjects ? good : bad} build a website<br/>
            {hasAccount && signedUp && beatenGame && !hasProjects
              ? <div>
                <p>create projects in the studio</p>
                <button className="pt-button pt-intent-primary font-md">Make a Project</button>
              </div>
              : null
            }
          </li>
          <li>
            {hasSubmitted ? good : bad}submit your project<br/>
            {hasAccount && signedUp && beatenGame && hasProjects && !hasSubmitted
              ? <div>
                <p>select a project before xx/xx/xx date</p>
                <button className="pt-button pt-intent-primary font-md">Submit your Project</button>
              </div>
              : null
            }
          </li>
        </ul>

        <Dialog
          className="form-container"
          iconName="inbox"
          isOpen={this.state.isAuthOpen}
          onClose={() => this.setState({isAuthOpen: false})}
          title="Dialog header"
        >
          <AuthForm initialMode="signup" />
        </Dialog>

        <Dialog
          className="form-container"
          iconName="inbox"
          isOpen={this.state.isSignupOpen}
          onClose={() => this.setState({isSignupOpen: false})}
          title="Dialog header"
        >
          <ContestSignup />
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

