import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import "./HomeAbout.css";

class HomeAbout extends Component {

  render() {
    const {locale, t, videos} = this.props;

    return (
      <div className="content-section">
        {/* video */}
        {/* container needed to make it responsive */}
        <div className="video-container">
          <iframe className="video-iframe"
            src={ `https://www.youtube-nocookie.com/embed/${ videos[locale] || videos.en }?rel=0` }
            frameBorder="0"
            allowFullScreen />
        </div>

        {/* about blurb */}
        <div className="about content-section limited-width">

          <h2 className="font-xl">{ t("Home.AboutHeading") }</h2>

          <p className="font-md">{ t("Home.AboutParagraph1") }</p>
          <p className="font-md">{ t("Home.AboutParagraph2") }</p>
          <p className="font-md">{ t("Home.AboutParagraph3") }</p>

          {/* about page link */}
          <Link to="/about" className="button font-md">
            { t("Home.AboutButton") }
          </Link>

        </div>
      </div>
    );
  }
}

export default translate()(HomeAbout);
