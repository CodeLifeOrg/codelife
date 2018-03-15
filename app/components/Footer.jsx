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

    const governmentLogos = false;

    // about link array
    const aboutLinks = [
      {id: 1, title: "About CodeLife", link: "/about"},
      {id: 2, title: "Partners", link: "/learnmore"},
      {id: 3, title: "Privacy policy", link: "/privacy"}
    ];
    const surveyLink = [
      {id: 4, title: "Survey", link: "/survey"}
    ];

    // explore link array (to be added as necessary)
    const exploreLinks = [
      /* {id: 1, title: "Leaderboard", link: "/leaderboard"},
      {id: 2, title: "Snippets", link: "/snippets"},
      {id: 3, title: "Codeblocks", link: "/codeblocks"}, */
      {id: 4, title: "Glossary", link: "/glossary"}
    ];

    // if logged in, add the survery to the aboutLinks array
    if (user) {
      aboutLinks.push(surveyLink[0]);
    }

    // loop through arrays and create corresponding list items
    const aboutLinkItems = aboutLinks.map(aboutLink =>
      <li className="footer-item" key={aboutLink.id}>
        <Link className="footer-link font-sm" to={aboutLink.link}>{t(aboutLink.title)}</Link>
      </li>
    );
    const exploreLinkItems = exploreLinks.map(exploreLink =>
      <li className="footer-item" key={exploreLink.id}>
        <Link className="footer-link font-sm" to={exploreLink.link}>{t(exploreLink.title)}</Link>
      </li>
    );

    return (
      <footer id="footer" className={ `footer ${className}` }>{/* :before element used for background image */}

        <div className="footer-inner">

          {/* hidden heading (for accessibility) */}
          <h2 className="u-visually-hidden">{ t("Navigation: ") }</h2>

          {/* list of links */}
          <nav className="footer-nav">

            {/* about links */}
            <div className="footer-list-container">
              <h3 className="footer-heading font-md">{ t("About ") }</h3> {/* space afterward is intentional, as full About Codelife link follows */}
              <ul className="footer-list">
                { aboutLinkItems }
              </ul>
            </div>

            {/* explore links */}
            <div className="footer-list-container">
              <h3 className="footer-heading font-md">{ t("Explore") }</h3>
              <ul className="footer-list">
                { exploreLinkItems }
              </ul>
            </div>

            {/* language select */}
            <div className="footer-list-container">
              <h3 className="footer-heading font-md">{ t("Language") }</h3>
              <ul className="footer-list">
                <li className="footer-item">
                  <a className="footer-link font-sm" href={`${protocol}//en.${hostSansSub}${currentPath}`}>English</a>
                </li>
                <li className="footer-item">
                  <a className="footer-link font-sm" href={`${protocol}//pt.${hostSansSub}${currentPath}`}>Portuguese</a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="footer-credits-container">

            {/* datawheel logo */}
            <a className="footer-logo-link" target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/">
              <span className="footer-logo-text font-sm">{ t("Built by ") }</span>
              <img className="footer-logo-img" src="/footer/logo-datawheel.svg" alt="Datawheel" />
            </a>

            {/* additional links */}
            <div className="footer-credits">
              <a target="_blank" className="footer-credits-link font-xs" rel="noopener noreferrer" href="http://www.fapemig.br/">Fundação de Amparo à Pesquisa do Estado de Minas Gerais</a>
              <a target="_blank" className="footer-credits-link font-xs" rel="noopener noreferrer" href="http://mg.gov.br">Governo do Estado de Minas Gerais</a>
            </div>

            {/* governmentLogos
              ? <a target="_blank" rel="noopener noreferrer" href="http://www.fapemig.br/"><img className="logo" src="/footer/logo-fapemig.svg" /></a>
              : null }
            { governmentLogos
              ? <a target="_blank" rel="noopener noreferrer" href="http://mg.gov.br"><img className="logo" src="/footer/logo-mg.svg" /></a>
              : null */}
          </div>
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
