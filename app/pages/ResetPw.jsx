import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {PasswordReset} from "../components/PasswordReset";
import "./ResetPw.css";

/**
 * Very small wrapper class for PasswordReset Component
 */

class ResetPw extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    // const {token} = this.props.location.query;
  }

  render() {
    const {location, t} = this.props;

    return (
      <div className="content u-vertical-align-children">
        <div className="form-container u-margin-auto">
          <h1 className="u-margin-top-off">{ t("Reset Password") }</h1>
          <PasswordReset router={this.props.router} location={ location } />
        </div>
      </div>
    );
  }
}

ResetPw = connect(state => ({
  locale: state.i18n.locale
}))(ResetPw);
export default translate()(ResetPw);
