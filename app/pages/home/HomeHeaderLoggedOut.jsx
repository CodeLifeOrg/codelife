import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import AuthForm from "components/AuthForm";
import {Dialog} from "@blueprintjs/core";
import CloudHalf from "components/CloudHalf.svg.jsx";
import "./HomeHeaderLoggedOut.css";

class HomeHeaderLoggedOut extends Component {

  constructor() {
    super();
    this.state = {
      isAuthFormOpen: false,
      authFormMode: "login"
    };
  }

  // set authform mode, toggle it open / closed
  handleAuthForm(mode) {
    this.setState({
      authFormMode: mode,
      isAuthFormOpen: !this.state.isAuthFormOpen
    });
  }

  render() {
    const {isAuthFormOpen} = this.state;
    const {t} = this.props;

    return (
      <div className="header home-header is-logged-out u-text-left-center">

        {/* headline/signup/login */}
        <div className="header-inner">

          {/* headline */}
          <h1 className="intro-headline u-margin-bottom-off font-xxl">{ t("Home.Headline")}</h1>
          <p className="intro-text font-lg u-margin-bottom-off">{ t("Home.IntroText")}</p>

          {/* buttons */}
          <div className="authform-button-group u-margin-bottom-off">
            <button className="authform-button button inverted-button font-md" onClick={this.handleAuthForm.bind(this, "login")}>
              <span className="pt-icon pt-icon-log-in" />
              {t("LogIn.Log_in")}
            </button>
            <button className="authform-button button inverted-button font-md" onClick={this.handleAuthForm.bind(this, "signup")}>
              <span className="pt-icon pt-icon-new-person" />
              { t("Sign Up")}
            </button>
          </div>
        </div>

        {/* clouds */}
        <div className="home-header-clouds">
          <CloudHalf />
          <CloudHalf />
        </div>

        {/* island container */}
        <div className="home-header-island">

          <div className="island-inner">
            {/* avatar */}
            <img className="island-avatar-img" alt=""
              src="/avatars/avatar-excited-transparent.png"
              srcSet="/avatars/avatar-excited-transparent.png 1x,
                      /avatars/avatar-excited-transparent@2x.png 2x" />
            {/* island */}
            <img className="island-img" src="/islands/island-jungle.png" alt=""/>
          </div>

        </div>

        {/* Authform */}
        <Dialog
          className="form-container"
          iconName="inbox"
          isOpen={isAuthFormOpen}
          onClose={this.handleAuthForm.bind(this)}
          title="Dialog header"
        >
          <AuthForm initialMode={this.state.authFormMode}/>
        </Dialog>
      </div>
    );
  }
}

export default translate()(HomeHeaderLoggedOut);
