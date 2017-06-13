import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import { Link } from 'react-router';

class Nav extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <Link classname="link" to={`/`}>{ t("Home") }</Link>&nbsp;&nbsp;&nbsp;
        <Link className="link" to="/lesson">{ t("Lessons") }</Link>&nbsp;&nbsp;&nbsp;
        <Link className="link" to="/glossary">{ t("Glossary") }</Link>&nbsp;&nbsp;&nbsp;
        <Link className="link" to="/profile">{ t("Profile") }</Link>&nbsp;&nbsp;&nbsp;
      </div>
    );
  }
}

export default translate()(Nav);