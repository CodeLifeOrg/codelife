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
          <p>{ t("CodeLife is a website for teenagers in Brazil to learn information technology and web skills for free.") }</p>
          <p>{ t("The platform is currently under development but early users will be invited to preview the site in summer 2017. Testing will begin with users in Greater Belo Horizonte but users in other regions eager to help us build CodeLife are encouraged to get in touch.") }</p>
          <p>{ t("The platform’s seed curriculum will cover dynamic web development and data visualization using the DataViva API.") }</p>
          <p>{ t("Interested in learning more? Sign up or shoot us an email.") }</p>
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
