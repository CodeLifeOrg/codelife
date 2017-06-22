import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";

// Nav Component
// Contains a list of links in Footer format, inserted at the bottom of each page

class Nav extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <Link className="link" to={"/"}>{ t("Home") }</Link>&nbsp;&nbsp;&nbsp;
        <Link className="link" to="/track">{ t("Tracks") }</Link>&nbsp;&nbsp;&nbsp;
        <Link className="link" to="/glossary">{ t("Glossary") }</Link>&nbsp;&nbsp;&nbsp;
        <Link className="link" to="/profile">{ t("Profile") }</Link>&nbsp;&nbsp;&nbsp;
        <Link className="link" to="/studio">{ t("Studio") }</Link>&nbsp;&nbsp;&nbsp;
      </div>
    );
  }
}

export default translate()(Nav);
