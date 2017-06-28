import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import "./Nav.css";

// Nav Component
// Contains a list of links in Footer format, inserted at the bottom of each page

class Nav extends Component {

  render() {
    
    const {t, user} = this.props;
    console.log(user);

    return (
      <div>
        <Link className="link" to={"/"}>{ t("Home") }</Link>
        { user
        ? <a className="link" href="/auth/logout">{ t("Logout") }</a> 
        : <span><Link className="link" to="/login">{ t("Login") }</Link> <Link className="link" to="/signup">{ t("Sign up") }</Link> </span>
        }
        <Link className="link" to="/track">{ t("Tracks") }</Link>
        <Link className="link" to="/glossary">{ t("Glossary") }</Link>
        <Link className="link" to="/profile">{ t("Profile") }</Link>
        <Link className="link" to="/studio">{ t("Studio") }</Link>
      </div>
    );
  }
}

Nav = connect(state => ({
  user: state.auth.user
}))(Nav);
Nav = translate()(Nav);
export default Nav;
