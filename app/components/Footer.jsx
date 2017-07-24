import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import "./Footer.css";

// Nav Component
// Contains a list of links in Footer format, inserted at the bottom of each page

class Nav extends Component {

  render() {

    const {className, t, user} = this.props;

    return (
      <footer id="footer" className={ className }>
        <div className="links">
          <Link className="link" to="/glossary">{ t("Glossary") }</Link>
        </div>
        <div className="logos">
          <a target="_blank" href="http://www.datawheel.us/"><img className="logo datawheel" src="/footer/logo-datawheel.svg" /></a>
          <a target="_blank" href="http://www.fapemig.br/"><img className="logo" src="/footer/logo-fapemig.svg" /></a>
          <a target="_blank" href="http://www.governo.mg.gov.br/"><img className="logo" src="/footer/logo-mg.svg" /></a>
        </div>
      </footer>
    );
  }
}

Nav = connect(state => ({
  user: state.auth.user
}))(Nav);
Nav = translate()(Nav);
export default Nav;
