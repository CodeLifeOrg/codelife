import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {changePassword, resetPassword, validateReset} from "@datawheel/canon-core/src/actions/auth";
import {translate} from "react-i18next";
import {Intent, Toaster} from "@blueprintjs/core";

import {
  RESET_PW_SUCCESS,
  RESET_SEND_FAILURE,
  RESET_SEND_SUCCESS,
  RESET_TOKEN_FAILURE,
  RESET_TOKEN_SUCCESS
} from "@datawheel/canon-core/src/consts";

/** 
 * Wrapper Component for the reset password dispatch action of canon
 */

class PasswordReset extends Component {

  constructor(props) {
    super(props);
    this.state = {
      password: "",
      email: "",
      submitted: false,
      toast: typeof window !== "undefined" ? Toaster.create() : null,
      token: false
    };
    this.onChange = this.onChange.bind(this);
  }

  /** 
   * On Mount, access the URL information from router and grab the token if it is there.
   */
  componentDidMount() {
    const {location} = this.props.router;
    const {token} = location ? location.query : this.props;
    if (token) {
      this.props.validateReset(token);
      this.setState({submitted: true});
    }
  }

  onChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  /**
   * Password field change handler, ensure passwords match before submitting dispatch
   */
  changePassword(e) {
    e.preventDefault();
    const {t, router} = this.props;
    const {password, passwordAgain, toast} = this.state;
    const {token} = router.location.query;
    if (password !== passwordAgain) {
      toast.show({iconName: "error", intent: Intent.DANGER, message: t("SignUp.error.PasswordMatch")});
      return;
    }
    this.props.changePassword(token, password);
  }

  resetPassword(e) {
    e.preventDefault();
    const {email} = this.state;
    this.props.resetPassword(email);
    this.setState({submitted: true});
  }

  /** 
   * Listen for changes to this.props.auth, and show a Toast message that reflects its state
   */
  componentDidUpdate() {

    const {auth, t, router} = this.props;
    const {submitted, toast, token} = this.state;

    const successMsg = t("Reset.actions.RESET_SEND_SUCCESS");
    const failMsg = t("Reset.actions.RESET_SEND_FAILURE");
    const tokenMsg = t("Reset.actions.RESET_TOKEN_FAILURE");

    if (!token && auth.msg === RESET_TOKEN_SUCCESS) {
      this.setState({token: true});
    }
    else if (submitted && !auth.loading && (auth.msg || auth.error)) {
      if (auth.msg === RESET_PW_SUCCESS) {
        router.push("/login");
      }
      else if (auth.msg === RESET_SEND_SUCCESS) {
        toast.show({iconName: "inbox", intent: Intent.SUCCESS, message: successMsg});
        this.setState({submitted: false});
      }
      else if (auth.error === RESET_SEND_FAILURE) {
        toast.show({iconName: "error", intent: Intent.DANGER, message: failMsg});
        this.setState({submitted: false});
      }
      else if (auth.error === RESET_TOKEN_FAILURE) {
        toast.show({iconName: "error", intent: Intent.DANGER, message: tokenMsg});
        this.setState({submitted: false});
      }
    }

  }

  render() {

    const {t} = this.props;
    const {email, password, passwordAgain, token} = this.state;

    if (token) {

      return (
        <form className="reset-form" id="passwordreset" onSubmit={this.changePassword.bind(this)}>

          {/* password */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="reset-password">{ t("Reset.Password") }</label>
            <input className="field-input"
              id="reset-password"
              value={password}
              type="password"
              name="password"
              onFocus={this.onChange}
              onChange={this.onChange}
              autoComplete="Off"
              autoFocus />
            <span className="field-icon pt-icon pt-icon-key" />
          </div>

          {/* password again */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="reset-password-again">{ t("Reset.Confirm Password") }</label>
            <input className="field-input"
              id="reset-password-again"
              value={passwordAgain}
              type="password"
              name="passwordAgain"
              onFocus={this.onChange}
              onChange={this.onChange}
              autoComplete="Off" />
            <span className="field-icon pt-icon pt-icon-key" />
          </div>

          {/* submit */}
          <div className="field-container">
            <button type="submit" className="pt-button pt-fill pt-intent-primary font-md">
              <span className="pt-icon pt-icon-refresh" />
              { t("Reset.button") }
            </button>
          </div>
        </form>
      );

    }
    else {

      return (
        <form className="reset-form" id="passwordreset" onSubmit={this.resetPassword.bind(this)}>

          {/* email */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="reset-email">{ t("Reset.E-mail") }</label>
            <input className="field-input"
              id="reset-email"
              value={email}
              type="email"
              name="email"
              onChange={this.onChange}
              autoFocus />
            <span className="field-icon pt-icon pt-icon-envelope" />
          </div>

          {/* submit */}
          <div className="field-container">
            <button type="submit" className="pt-button pt-fill pt-intent-primary font-md">
              <span className="pt-icon pt-icon-refresh" />
              { t("Reset.button") }
            </button>
          </div>
        </form>
      );

    }

  }
}

PasswordReset.contextTypes = {
  browserHistory: PropTypes.object
};

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  changePassword: (token, password) => {
    dispatch(changePassword(token, password));
  },
  resetPassword: email => {
    dispatch(resetPassword(email));
  },
  validateReset: token => {
    dispatch(validateReset(token));
  }
});

PasswordReset = translate()(PasswordReset);
PasswordReset = connect(mapStateToProps, mapDispatchToProps)(PasswordReset);
export {PasswordReset};
