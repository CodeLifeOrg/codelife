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

    const {auth, t} = this.props;

    return (
      <div id="nav">
        <Link to={"/"}><img className="logo" src="/logo/logo-sm.png" /></Link>
        <div className="links">
          { auth.user
          ? <div>
              <Link className="link" to="/lesson">{ t("Overworld") }</Link>
              <Link className="link" to={`/studio/${auth.user.username}`}>{ t("Studio") }</Link>
              <Popover
                interactionKind={PopoverInteractionKind.HOVER}
                popoverClassName="pt-popover-content-sizing"
                position={Position.BOTTOM}
              >
                <div className="link">{ auth.user.username }<span className="pt-icon-standard pt-icon-user"></span></div>
                <div>
                  <Link className="pt-button pt-intent-primary pt-fill" to={ `/profile/${ auth.user.username }` }>{ t("Profile") }</Link>
                  <a className="pt-button pt-intent-primary pt-fill" href="/auth/logout">{ t("Logout") }</a>
                </div>
              </Popover>
            </div>
          : null }
        </div>
      </div>
    );
  }
}

Nav = connect(state => ({
  auth: state.auth
}))(Nav);
Nav = translate()(Nav);
export default Nav;
