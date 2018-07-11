import React, {Component} from "react";
import {connect} from "react-redux";
import {signup} from "datawheel-canon/src/actions/auth";
import {translate} from "react-i18next";
import {Intent, Toaster} from "@blueprintjs/core";

import TwitterIcon from "./TwitterIcon.svg.jsx";
import FacebookIcon from "./FacebookIcon.svg.jsx";
import InstagramIcon from "./InstagramIcon.svg.jsx";

import "./SignupForm.css";

/** 
 * Sister component to AuthForm, this component wraps the Canon "signup" action and does appropriate error checking
 */

class SignupForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      agreedToTerms: false,
      error: null,
      password: "",
      passwordAgain: "",
      email: null,
      toast: typeof window !== "undefined" ? Toaster.create() : null
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    const val = e.target.name === "agreedToTerms" ? e.target.checked : e.target.value;
    this.setState({[e.target.name]: val});
  }

  /**
   * When the user clicks submit, verify some info before calling datawheel-canon's `signup` action
   */
  onSubmit(e) {
    e.preventDefault();
    const {redirect, t} = this.props;
    const {email, password, passwordAgain} = this.state;
    let {username} = this.state;

    if (password !== passwordAgain) {
      this.setState({error: {iconName: "lock", message: t("SignUp.error.PasswordMatch")}});
    }
    else if (!username || !email || !password) {
      this.setState({error: {iconName: "id-number", message: t("SignUp.error.IncompleteFields")}});
    }
    // NOTE: disabling terms of service check until we have actual terms of service
    // else if ((legal.privacy || legal.terms) && !agreedToTerms) {
    //   this.setState({error: {iconName: "saved", message: t("SignUp.error.TermsAgree")}});
    // }
    else {
      // strip the username of any leading or trailing spaces
      username = username.replace(/^\s+|\s+$/gm, "");
      this.props.signup({username, email, password, redirect});
      this.setState({submitted: true});
    }
  }

  componentDidUpdate() {
    const {error} = this.state;

    if (error) {
      this.showToast(error.message, error.iconName, error.intent);
      this.setState({error: false});
    }

  }

  showToast(message, iconName = "lock", intent = Intent.DANGER) {
    const {toast} = this.state;
    toast.show({iconName, intent, message});
  }

  render() {
    const {auth, social, t} = this.props;
    const email = this.state.email === null ? auth.error && auth.error.email ? auth.error.email : "" : this.state.email;

    return (
      <div className="signup-container">

        {/* heading */}
        <h2 className="signup-heading font-xl u-text-center">{ t("SignUp.Sign Up") }</h2>

        {/* signup form */}
        <form className="form-inner" onSubmit={this.onSubmit.bind(this)}>

          {/* email */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="signup-email">{ t("SignUp.Email") }</label>
            <input className="field-input"
              id="signup-email"
              value={email}
              type="email"
              name="email"
              onChange={this.onChange}
              autoFocus />
            <span className="field-icon pt-icon pt-icon-envelope" />
          </div>

          {/* username */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="signup-username">{ t("SignUp.Username") }</label>
            <input className="field-input"
              id="signup-username"
              value={this.state.username}
              type="text"
              name="username"
              onFocus={this.onChange}
              onChange={this.onChange} />
            <span className="field-icon pt-icon pt-icon-id-number" />
          </div>

          {/* password */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="signup-password">{ t("SignUp.Password") }</label>
            <input className="field-input"
              id="signup-password"
              value={this.state.password}
              type="password"
              name="password"
              onFocus={this.onChange}
              onChange={this.onChange}
              required="true"
              minLength="8"
              autoComplete="Off" />
            <span className="field-icon pt-icon pt-icon-key" />
          </div>

          {/* password again */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="signup-password-again">{ t("SignUp.PasswordAgain") }</label>
            <input className="field-input"
              id="signup-password-again"
              value={this.state.passwordAgain}
              type="password"
              name="passwordAgain"
              onFocus={this.onChange}
              onChange={this.onChange}
              required="true"
              minLength="8"
              autoComplete="Off" />
            <span className="field-icon pt-icon pt-icon-key" />
          </div>

          {/* legal.privacy || legal.terms
            ? <label className="pt-control pt-checkbox" htmlFor="ppcbox">
              <input type="checkbox" id="ppcbox" name="agreedToTerms" checked={agreedToTerms} onChange={this.onChange} />
              <span className="pt-control-indicator" />
              <span dangerouslySetInnerHTML={{__html: legal.privacy && legal.terms ? t("SignUp.PrivacyTermsText") : legal.privacy ? t("SignUp.PrivacyText") : t("SignUp.TermsText"), legal}}></span>
            </label>
            : null */}

          {/* submit */}
          <div className="field-container">
            <button type="submit" className="pt-button pt-fill pt-intent-primary font-md">
              <span className="pt-icon pt-icon-user" />
              { t("SignUp.Create account") }
            </button>
          </div>
        </form>

        {/* divider */}
        <div className="form-divider signup-divider u-text-center">
          <p className="signup-divider-text font-md heading">{ t("Or") }</p>
        </div>

        {/* social buttons */}
        <div className="social-button-list">
          { social.includes("twitter") ? <div className="field-container">
            <a href="/auth/twitter" className="social-button pt-button pt-intent-primary font-md">
              <TwitterIcon />
              <span className="social-button-text">{ t("SignUp.WithTwitter") }</span>
            </a>
          </div> : null }
          { social.includes("facebook") ? <div className="field-container">
            <a href="/auth/facebook" className="social-button pt-button pt-intent-primary font-md">
              <FacebookIcon />
              <span className="social-button-text">{ t("SignUp.WithFacebook") }</span>
            </a>
          </div> : null }
          { social.includes("instagram") ? <div className="field-container">
            <a href="/auth/instagram" className="social-button pt-button pt-intent-primary font-md">
              <InstagramIcon />
              <span className="social-button-text">{ t("SignUp.WithInstagram") }</span>
            </a>
          </div> : null }
        </div>

        {/* footer */}
        <p className="form-switcher font-sm u-text-center">
          { t("SignUp.GotAccount")} <button className="u-unbutton link" onClick={() => this.props.onSwitch ? this.props.onSwitch() : null}>{ t("LogIn.Log_in") }</button>
        </p>
      </div>
    );
  }
}

SignupForm.defaultProps = {
  redirect: "/"
};

const mapStateToProps = state => ({
  auth: state.auth,
  legal: state.legal,
  social: state.social
});

const mapDispatchToProps = dispatch => ({
  signup: userData => {
    dispatch(signup(userData));
  }
});

SignupForm = connect(mapStateToProps, mapDispatchToProps)(SignupForm);
SignupForm = translate()(SignupForm);
export default translate()(SignupForm);
