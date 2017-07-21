import React, {Component} from "react";
import {Login, SignUp} from "datawheel-canon";
import Clouds from "./Clouds";

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
    const {signup} = this.state;

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
              <button className="pt-button pt-fill" onClick={ this.toggleSignup.bind(this) }>Sign Up</button>
            </div>
          }
        </div>
      </div>
    );

  }
}

export default Splash;
