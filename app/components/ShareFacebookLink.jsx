import React, {Component} from "react";
import {translate} from "react-i18next";
import Loading from "components/Loading";

import FacebookIcon from "components/FacebookIcon.svg.jsx";

class ShareFacebookLink extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {t, screenshotReady, context, shareLink} = this.props;

    // define button text based on `context` prop
    let buttonLabel = "";
    context === "project" ? buttonLabel = t("Project.Share") : buttonLabel = t("CodeBlockEditor.Share");

    // define loading text
    const loadingText = t("Generating screenshot");

    return (
      screenshotReady !== true
        // loading spinner
        ? <p className="font-md is-disabled u-margin-top-md" target="_blank">
          { loadingText }
          <Loading label={false} />
        </p>
        // facebook share link
        : <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`} className="share-button social-button pt-button pt-intent-primary font-md" target="_blank">
          <FacebookIcon />
          <span className="social-button-text">{ buttonLabel }</span>
          <span className="u-visually-hidden">{ t(" on Facebook") }</span>
        </a>
    );
  }
}

ShareFacebookLink.defaultProps = {
  context: "project",
  screenshotReady: true
};

ShareFacebookLink = translate()(ShareFacebookLink);
export default ShareFacebookLink;
