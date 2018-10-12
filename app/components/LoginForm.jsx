import React, {Component} from "react";
import {connect} from "react-redux";
import {login, resetPassword} from "@datawheel/canon-core/src/actions/auth";
import {translate} from "react-i18next";

import TwitterIcon from "./TwitterIcon.svg.jsx";
import FacebookIcon from "./FacebookIcon.svg.jsx";
import InstagramIcon from "./InstagramIcon.svg.jsx";

import "./LoginForm.css";

/**
 * Works alongside SignUpForm to log users in. Essentially a wrapper for the canon "login" action
 */

class LoginForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      password: "",
      email: ""
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  /**
   * The login dispatch is mapped to props and called here
   */
  onSubmit(e) {
    e.preventDefault();
    const {redirect} = this.props;
    const {email, password} = this.state;
    this.props.login({email, password, redirect});
  }

  render() {

    const {social, t} = this.props;
    const {email, password} = this.state;

    return (
      <div className="login-container">

        {/* heading */}
        <h2 className="signup-heading font-xl u-text-center">{ t("LogIn.Log_in") }</h2>

        {/* login form */}
        <form className="form-inner" onSubmit={this.onSubmit.bind(this)}>

          {/* email */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="login-email">{ t("LogIn.Email") }</label>
            <input className="field-input"
              id="login-email"
              value={email}
              type="email"
              name="email"
              onChange={this.onChange}
              autoFocus />
            <span className="field-icon pt-icon pt-icon-envelope" />
          </div>

          {/* password */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="login-password">{ t("SignUp.Password") }</label>
            <input className="field-input"
              id="login-password"
              value={password}
              type="password"
              name="password"
              onFocus={this.onChange}
              onChange={this.onChange}
              autoComplete="Off" />
            <span className="field-icon pt-icon pt-icon-key" />
            <a className="reset-password-link link font-xs" href="/reset">{ t("SignUp.ForgotPassword") }</a>
          </div>

          {/* stay logged in */}
          {/* <div className="field-container switch-field-container font-sm">
            <label className="pt-control pt-switch">
              <input type="checkbox" />
              <span className="pt-control-indicator" />
              { t("LogIn.StayLoggedIn") }
            </label>
          </div> */}

          {/* submit */}
          <div className="field-container">
            <button type="submit" className="pt-button pt-fill pt-intent-primary font-md">
              <span className="pt-icon pt-icon-log-in" />
              { t("LogIn.Log_in") }
            </button>
          </div>
        </form>

        {/* divider */}
        <div className="form-divider login-divider u-text-center">
          <p className="signup-divider-text font-md heading">{ t("Or") }</p>
        </div>

        {/* social buttons */}
        <div className="social-button-list">
          { social.includes("twitter") ? <div className="field-container">
            <a href="/auth/twitter" className="social-button pt-button pt-intent-primary font-md">
              <TwitterIcon />
              <span className="social-button-text">{ t("LogIn.WithTwitter") }</span>
            </a>
          </div> : null }
          { social.includes("facebook") ? <div className="field-container">
            <a href="/auth/facebook" className="social-button pt-button pt-intent-primary font-md">
              <FacebookIcon />
              <span className="social-button-text">{ t("LogIn.WithFacebook") }</span>
            </a>
          </div> : null }
          { social.includes("instagram") ? <div className="field-container">
            <a href="/auth/instagram" className="social-button pt-button pt-intent-primary font-md">
              <InstagramIcon />
              <span className="social-button-text">{ t("LogIn.WithInstagram") }</span>
            </a>
          </div> : null }
        </div>

        {/* footer */}
        <p className="form-switcher font-sm u-text-center">
          { t("LogIn.NoAccount")} <button className="u-unbutton link" onClick={() => this.props.onSwitch ? this.props.onSwitch() : null}>{ t("SignUp.Sign Up") }</button>
        </p>
      </div>
    );
  }
}

LoginForm.defaultProps = {
  redirect: "/"
};

const mapStateToProps = state => ({
  auth: state.auth,
  mailgun: state.mailgun,
  social: state.social
});

const mapDispatchToProps = dispatch => ({
  login: userData => {
    dispatch(login(userData));
  },
  resetPassword: email => {
    dispatch(resetPassword(email));
  }
});

LoginForm = translate()(LoginForm);
LoginForm = connect(mapStateToProps, mapDispatchToProps)(LoginForm);
export default translate()(LoginForm);
