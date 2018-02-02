import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import {AnchorLink} from "datawheel-canon";
import "./Nav.css";

import {Popover, PopoverInteractionKind, Position} from "@blueprintjs/core";

// Nav Component
// Contains a list of links in Footer format, inserted at the bottom of each page

class Nav extends Component {

  render() {

    const {auth, logo, t} = this.props;

    return (
      <div id="nav">
        { logo
          ? <Link className="logo" to={"/"}>
            <div className="tag">Beta</div>
            <img className="text" src="/logo/logo-sm.png" />
          </Link>
          : <div></div> }
        { auth.user
          ? <div className="links">
            <Link className="link" to="/island"><span className="pt-icon-standard pt-icon-path-search" />{ t("Map") }</Link>
            <Link className="link" to={`/projects/${auth.user.username}`}><span className="pt-icon-standard pt-icon-book" />{ t("Projects") }</Link>
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              popoverClassName="pt-popover-content-sizing user-popover"
              position={Position.BOTTOM_RIGHT}
            >
              <Link className="link" to={ `/profile/${ auth.user.username }` }><span className="pt-icon-standard pt-icon-user" />{ auth.user.username }</Link>
              <div>
                <Link className="pt-button" to={ `/profile/${ auth.user.username }` }>{ t("Profile") }</Link>
                { auth.user.role > 0 ? <Link className="pt-button" to="/admin">{ t("Admin") }</Link> : null }
                <a className="pt-button" href="/auth/logout">{ t("Logout") }</a>
              </div>
            </Popover>
          </div>
          : <div className="links">
            { logo
              ? <Link className="link" to="/#login"><span className="pt-icon-standard pt-icon-user" />{ t("Login.Login") }/{ t("SignUp.Sign Up") }</Link>
              : <AnchorLink className="link" to="login"><span className="pt-icon-standard pt-icon-user" />{ t("Login.Login") }/{ t("SignUp.Sign Up") }</AnchorLink> }
            <Link className="link" to="/about"><span className="pt-icon-standard pt-icon-help" />{ t("About") }</Link>
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
