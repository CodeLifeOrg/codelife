import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import "./Footer.css";

class Footer extends Component {
  render() {
    const {className, currentPath, t, user, serverLocation} = this.props;
    const {protocol, host} = serverLocation;
    const hostSansSub = host.replace("pt.", "").replace("en.", "").replace("www.", "");

    return (
      <footer id="footer" className={ className }>
        <div className="links">
          <Link className="link" to="/glossary">{ t("Glossary") }</Link>
          <Link className="link" to="/about">{ t("About") }</Link>
          <Link className="link" to="/privacy">{ t("Privacy Policy") }</Link>
          <Link className="link" to="/learnmore">{ t("Learn More") }</Link>
          { user ? <Link className="link" to="/survey">{ t("Survey") }</Link> : null }
          <a className="link language" href={`${protocol}//en.${hostSansSub}${currentPath}`} >EN</a> | <a className="link language" href={`${protocol}//pt.${hostSansSub}${currentPath}`} >PT</a>
        </div>
        <div className="logos">
          <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/"><img className="logo datawheel" src="/footer/logo-datawheel.svg" /></a>
          <a target="_blank" rel="noopener noreferrer" href="http://www.fapemig.br/"><img className="logo" src="/footer/logo-fapemig.svg" /></a>
          <a target="_blank" rel="noopener noreferrer" href="http://www.governo.mg.gov.br/"><img className="logo" src="/footer/logo-mg.svg" /></a>
        </div>
      </footer>
    );
  }
}

Footer.defaultProps = {
  className: ""
};

Footer = connect(state => ({
  user: state.auth.user,
  serverLocation: state.location
}))(Footer);
Footer = translate()(Footer);
export default Footer;
