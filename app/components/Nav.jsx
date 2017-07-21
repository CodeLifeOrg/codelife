import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import "./Nav.css";

import {Popover, PopoverInteractionKind, Position} from "@blueprintjs/core";

// Nav Component
// Contains a list of links in Footer format, inserted at the bottom of each page

class Nav extends Component {

  render() {

    const {t, user} = this.props;

    return (
      <div id="nav">
        <Link to={"/"}><img className="logo" src="/logo/logo-sm.png" /></Link>
        <div className="links">
          <Link className="link" to="/lesson">{ t("Overworld") }</Link>
          <Link className="link" to={`/studio/${user.username}`}>{ t("Studio") }</Link>
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            popoverClassName="pt-popover-content-sizing"
            position={Position.BOTTOM}
          >
            <div className="link">{ user.username }<span className="pt-icon-standard pt-icon-user"></span></div>
            <div>
              <Link className="pt-button pt-fill" to={ `/profile/${ user.username }` }>{ t("Profile") }</Link>
              <a className="pt-button pt-fill" href="/auth/logout">{ t("Logout") }</a>
            </div>
          </Popover>
        </div>
      </div>
    );
  }
}

Nav = connect(state => ({
  user: state.auth.user
}))(Nav);
Nav = translate()(Nav);
export default Nav;
