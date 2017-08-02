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

    const {auth, logo, t} = this.props;

    return (
      <div id="nav">
        { logo ? <Link to={"/"}><img className="logo" src="/logo/logo-sm.png" /></Link> : <div></div> }
        <div className="links">
          { auth.user
          ? <div>
              <Link className="link" to="/lesson">{ t("Map") }</Link>
              <Link className="link" to={`/studio/${auth.user.username}`}>{ t("Studio") }</Link>
              <Popover
                interactionKind={PopoverInteractionKind.HOVER}
                popoverClassName="pt-popover-content-sizing user-popover"
                position={Position.BOTTOM_RIGHT}
              >
                <Link className="link" to={ `/profile/${ auth.user.username }` }>{ auth.user.username }<span className="pt-icon-standard pt-icon-user"></span></Link>
                <div>
                  <Link className="pt-button pt-fill" to={ `/profile/${ auth.user.username }` }>{ t("Profile") }</Link>
                  <a className="pt-button pt-fill" href="/auth/logout">{ t("Logout") }</a>
                </div>
              </Popover>
            </div>
          : null }
        </div>
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
