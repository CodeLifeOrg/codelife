import React, {Component} from "react";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import {translate} from "react-i18next";
import {Login, SignUp} from "datawheel-canon";
import Clouds from "components/Clouds";

import "./Splash.css";

class Splash extends Component {

  constructor() {
    super();
    this.state = {signup: false};
  }

  toggleSignup() {
    this.setState({signup: !this.state.signup});
  }

  render() {

    const {auth, t} = this.props;
    const {signup} = this.state;

    if (auth && auth.user) browserHistory.push("/");

    return (
      <div id="splash">
        <Clouds />
        <div className="center-block">
          <img className="island" src="/islands/splash.png" />
          <img className="logo" src="/logo/logo.png" />
          { signup
          ? <SignUp className="form" />
          : <div className="form">
              <Login />
              <button className="pt-button pt-fill" onClick={ this.toggleSignup.bind(this) }>{ t("Sign Up") }</button>
            </div>
          }
        </div>
        <div className="about">
          <h2>{ t("About") }</h2>
          <p>{ t("splashP1") }</p>
          <p>{ t("splashP2") }</p>
          <p>{ t("splashP3") }</p>
          <p>{ t("splashP4") }</p>
        </div>
      </div>
    );

  }
}

Splash = connect(state => ({
  auth: state.auth
}))(Splash);
Splash = translate()(Splash);
export default Splash;
