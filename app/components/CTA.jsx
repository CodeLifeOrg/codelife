import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import AuthForm from "components/AuthForm";

import "./CTA.css";

import {Dialog} from "@blueprintjs/core";

// Call To Action Component
// Used to persuade users to use the site in useful ways

class CTA extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoginOpen: false
    };
  }

  authForm(mode) {
    this.setState({formMode: mode, isLoginOpen: !this.state.isLoginOpen});
  }

  render() {
    const {context, t} = this.props;
    const {isLoginOpen} = this.state;

    return (
      <div className="cta u-text-center">

        <h2 className="cta-heading u-margin-top-off u-margin-bottom-off font-xl">
          {/* home page cta; default */}
          { context === "home" ? t("Home.CTA") : null }
          {/* lesson plan cta */}
          { context === "lessonplan" ? t("Lessonplan.CTA") : null }
        </h2>

        {/* login | signup button */}
        <button className="cta-button pt-button pt-intent-primary font-md u-margin-top-md" onClick={this.authForm.bind(this, "signup")}>
          { t("Home.GetStarted") }
        </button>

        {/* the login/signup dialog, again */}
        <Dialog
          className="form-container"
          iconName="inbox"
          isOpen={isLoginOpen}
          onClose={this.authForm.bind(this)}
          title="Dialog header"
        >
          <AuthForm initialMode={this.state.formMode} />
        </Dialog>

      </div>
    );
  }
}

CTA.defaultProps = {
  context: "home"
};

CTA = connect(state => ({
  auth: state.auth,
  serverLocation: state.location
}))(CTA);
CTA = translate()(CTA);
export default CTA;
