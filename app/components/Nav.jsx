import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import {AnchorLink} from "datawheel-canon";
import Browser from "components/Browser";
import "./Nav.css";

import {Popover, PopoverInteractionKind, Position} from "@blueprintjs/core";

// Nav Component
// Contains a list of links in Footer format, inserted at the bottom of each page

class Nav extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showBrowser: false
    };
  }

  /* 
  This progress reloader is not robust. Ideally, userprogress should be loaded once ever, live in redux state,
  and update each time the user beats a level in parallel with updating the underlying database. However, to 
  avoid a refactor, the following code manually reaches into the Browser component and reloads userprogress 
  on each open/close of the panel.  TODO: revisit this 
  */
  toggleBrowser() {
    this.setState({showBrowser: !this.state.showBrowser});
    if (this.browser) this.browser.getWrappedInstance().getWrappedInstance().reloadProgress();
  }

  reportClick() {
    this.setState({showBrowser: false});
  }

  render() {

    const {auth, logo, t, linkObj} = this.props;
    const {showBrowser} = this.state;

    return (
      <div className="nav" id="nav">
        { auth.user 
          ? <div>
            <div className="hamburger" style={{position: "absolute", top: 7, left: 7}}>
              <button className="pt-button pt-icon-menu" onClick={this.toggleBrowser.bind(this)} />
            </div>
            <div id="browser" className={showBrowser ? "" : "hide"}>
              <Browser ref={b => this.browser = b} linkObj={linkObj} reportClick={this.reportClick.bind(this)}/>
            </div>
          </div>
          : null
        }
        { logo
          ? <Link className="logo" to={"/"}>
            <div className="tag">Beta</div>
            <img className="text" src="/logo/logo-sm.png" alt="Codelife" />
          </Link>
          : <div></div> }
        { auth.user
          ? <div className="links">
            <Link className="link" to="/island">
              <span className="link-icon pt-icon-standard pt-icon-path-search" />
              <span className="link-text">{ t("Map") }</span>
            </Link>
            <Link className="link" to={`/projects/${auth.user.username}`}>
              <span className="link-icon pt-icon-standard pt-icon-book" />
              <span className="link-text">{ t("Projects") }</span>
            </Link>
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              popoverClassName="pt-popover-content-sizing user-popover"
              position={Position.BOTTOM_RIGHT}
            >
              <Link className="link" to={ `/profile/${ auth.user.username }` }>
                <span className="link-icon pt-icon-standard pt-icon-user" />
                <span className="link-text">{ auth.user.username }</span>
              </Link>
              <div>
                <Link className="pt-button" to={ `/profile/${ auth.user.username }` }>
                  { t("Profile") }
                </Link>
                { auth.user.role > 0 ? <Link className="pt-button" to="/admin">
                  { t("Admin") }
                </Link> : null }
                <a className="pt-button" href="/auth/logout">
                  { t("Logout") }
                </a>
              </div>
            </Popover>
          </div>
          : <div className="links">
            { logo
              ? <Link className="link" to="/#login">
                <span className="link-icon pt-icon-standard pt-icon-user" />
                <span className="link-text">{ t("Login.Login") }/{ t("SignUp.Sign Up") }</span>
              </Link>
              : <AnchorLink className="link" to="login">
                <span className="link-icon pt-icon-standard pt-icon-user" />
                <span className="link-text">{ t("Login.Login") }/{ t("SignUp.Sign Up") }</span>
              </AnchorLink> }
              <Link className="link" to="/about">
                <span className="link-icon pt-icon-standard pt-icon-help" />
                <span className="link-text">{ t("About") }</span>
              </Link>
          </div> }
      </div>
    );
  }
}

Nav.defaultProps = {
  logo: true
};

Nav = connect(state => ({
  auth: state.auth
}))(Nav);
Nav = translate()(Nav);
export default Nav;
