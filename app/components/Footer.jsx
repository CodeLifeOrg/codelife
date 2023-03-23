import React, { Component } from "react";
import { translate } from "react-i18next";
import { Link } from "react-router";
import { connect } from "react-redux";
import "./Footer.css";

import FacebookIcon from "./FacebookIcon.svg.jsx";
import InstagramIcon from "./InstagramIcon.svg.jsx";
import YoutubeIcon from "./YoutubeIcon.svg.jsx";
import CompetIcon from "./CompetIcon.svg.jsx";
class Footer extends Component {

  /* logout function */
  handleLogout() {
    window.location.href = "/auth/logout";
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  }

  render() {
    const { className, currentPath, t, user, serverLocation } = this.props;
    const { protocol, host } = serverLocation;
    const hostSansSub = host
      .replace("pt.", "")
      .replace("en.", "")
      .replace("www.", "");

    // about link array
    const aboutLinks = [
      { id: 1, title: t("About"), link: "/about" },
      { id: 2, title: t("Privacy Policy"), link: "/privacy" },
      { id: 3, title: t("Partners"), link: "/learnmore" },
      { id: 4, title: t("Contact"), link: "/contact" },
    ];

    /*
    const surveyLink = [
      {id: 4, title: t("Survey"), link: "/survey"}
    ];
    */

    // explore link array (to be added as necessary)
    const exploreLinks = [
      { id: 1, title: t("Lesson plan"), link: "/lessonplan" },
      { id: 2, title: t("Glossary"), link: "/glossary" }
    ];
    const leaderboardLink = [
      { id: 3, title: t("Leaderboard"), link: "/leaderboard" }
    ];

    // account link array — must be logged in
    const username = user ? user.username : "";

    const accountLinks = [
      { id: 1, title: t("My profile"), link: `/profile/${username}` },
      { id: 2, title: t("My projects"), link: `/projects/${username}` },
      { id: 3, title: t("Log out"), link: "/auth/logout" }
    ];

    const adminLink = [{ id: 4, title: t("Admin"), link: "/admin" }];

    // if logged in, add additional links to footer
    if (user) {
      // aboutLinks.push(surveyLink[0]); // outdated survey content
      exploreLinks.push(leaderboardLink[0]);

      // if admin, add admin link to footer
      if (user.role > 0) {
        accountLinks.push(adminLink[0]);
      }
    }

    // language select links
    const languageLinks = [
      {
        id: 1,
        title: t("Portuguese"),
        link: `${protocol}//pt.${hostSansSub}${currentPath}`
      },
      {
        id: 2,
        title: t("English"),
        link: `${protocol}//en.${hostSansSub}${currentPath}`
      }
    ];

    // social links
    const socialLinks = [
      {
        id: 1,
        title: "facebook",
        link: "https://www.facebook.com/CodeLifeBR/"
      },
      {
        id: 2,
        title: "youtube",
        link: "https://www.youtube.com/channel/UCR6iTxyV9jdSy21eqS1Ovyg"
      },
      {
        id: 3,
        title: "instagram",
        link: "https://www.instagram.com/codelifebr/"
      },

    ];

    // loop through arrays and create corresponding list items
    const aboutLinkItems = aboutLinks.map(aboutLink =>
      <li className="footer-item" key={aboutLink.id}>
        <Link className="footer-link font-sm" to={aboutLink.link}>
          {t(aboutLink.title)}
        </Link>
      </li>
    );
    const exploreLinkItems = exploreLinks.map(exploreLink =>
      <li className="footer-item" key={exploreLink.id}>
        <Link className="footer-link font-sm" to={exploreLink.link}>
          {t(exploreLink.title)}
        </Link>
      </li>
    );
    // logout must be a standard link, not a Link component
    const accountLinkItems = accountLinks.map(accountLink =>
      <li className="footer-item" key={accountLink.id}>
        {accountLink.link === "/auth/logout"
          ? <a
            className="footer-link font-sm"
            onClick={() => this.handleLogout()}
          >
            {t(accountLink.title)}
          </a>
          : <Link className="footer-link font-sm" to={accountLink.link}>
            {t(accountLink.title)}
          </Link>
        }
      </li>
    );
    // locale subdomain links must be standard links, not Link components
    const languageLinkItems = languageLinks.map(languageLink =>
      <li className="footer-item" key={languageLink.id}>
        <a className="footer-link font-sm" href={languageLink.link}>
          {t(languageLink.title)}
        </a>
      </li>
    );
    // social links
    const socialLinkItems = socialLinks.map(socialLink =>
      <li className="footer-social-item" key={socialLink.id}>
        <a
          className={`footer-social-link font-sm ${socialLink.title
            }-footer-social-link`}
          href={socialLink.link}
        >
          <span className="u-visually-hidden">{t(socialLink.title)}</span>
          {socialLink.title === "facebook" && <FacebookIcon />}
          {socialLink.title === "youtube" && <YoutubeIcon />}
          {socialLink.title === "instagram" && <InstagramIcon />}
        </a>
      </li>
    );

    return (
      <footer id="footer" className={`footer ${className}`}>
        {/* :before element used for background image */}

        <div className="footer-inner">
          {/* hidden heading (for accessibility) */}
          <h2 className="u-visually-hidden">{t("Navigation")}</h2>

          {/* list of links */}
          <nav className="footer-nav" role="navigation">
            {/* about links */}
            <div className="footer-list-container">
              <h3 className="footer-heading">{t("About ")}</h3>{" "}
              {/* space afterward is intentional, as full About Codelife link follows */}
              <ul className="footer-list">{aboutLinkItems}</ul>
            </div>

            {/* explore links */}
            <div className="footer-list-container">
              <h3 className="footer-heading">{t("Explore")}</h3>
              <ul className="footer-list">{exploreLinkItems}</ul>
            </div>

            {/* account links */}
            {user
              ? <div className="footer-list-container">
                <h3 className="footer-heading">{t("Account")}</h3>
                <ul className="footer-list">{accountLinkItems}</ul>
              </div>
              : null}

            {/* language select */}
            <div className="footer-list-container">
              <h3 className="footer-heading">{t("Language")}</h3>
              <ul className="footer-list">{languageLinkItems}</ul>
            </div>
          </nav>

          <div className="footer-credits-container" role="contentinfo">
            {/* social links */}
            <ul className="footer-social-list u-list-reset">
              {socialLinkItems}
            </ul>

            {/* datawheel logo */}
            <a
              className="footer-logo-link"
              target="_blank"
              rel="noopener noreferrer"
              href="http://www.datawheel.us/"
            >
              <span className="footer-logo-text font-sm">{t("Built by ")}</span>
              <img
                className="footer-logo-img"
                src="/footer/logo-datawheel.svg"
                alt="Datawheel"
              />
            </a>
            <a
              className="footer-credits"
              target="_blank"
              rel="noopener noreferrer"
              href="https://compet.vercel.app">
              <span className="footer-logo-text font-sm">{t("Built by ")}</span>
              <CompetIcon />
              <span> COMPET - Pet da Engenharia de Computação do Cefet - MG</span>            </a>
            {/* additional links */}
            <div className="footer-credits">
              {/* <p className="font-xs">Fundação de Amparo à Pesquisa do Estado de Minas Gerais</p> */}
              <p className="font-xs">Governo do Estado de Minas Gerais</p>
              <a
                className="footer-credits-link"
                href="http://www.fapemig.br/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="footer-credits-logo"
                  src="/footer/logo-fapemig.svg"
                  alt="Fundação de Amparo à Pesquisa de Minas Gerais"
                />
              </a>
              {/* <a className="footer-credits-link" href="http://mg.gov.br" target="_blank" rel="noopener noreferrer">
                <img className="footer-credits-logo" src="/footer/logo-mg.svg" alt="Estado de Minas Gerais" />
              </a> */}
              <a
                className="footer-credits-link"
                href="https://www.linkedin.com/company/innpact-ventures"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="footer-credits-logo"
                  src="/footer/logo-innpact.svg"
                  alt="Innpact Ventures"
                />
              </a>
            </div>
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
