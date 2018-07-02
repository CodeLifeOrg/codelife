import React, {Component} from "react";
import {translate} from "react-i18next";
import LoadingSpinner from "components/LoadingSpinner";

import FacebookIcon from "components/FacebookIcon.svg.jsx";

/**
 * Component for sharing facebook links. Due to the fact that xvfb screenshots require a few seconds to render, 
 * this component receives a "screenshotReady" prop from the embedding component, which waits a few seconds 
 * to ensure that Facebook's FIRST capture of the page has the finished screenshot
 */

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
      !screenshotReady
        // loading spinner
        ? <p className="font-md is-disabled u-margin-top-md" target="_blank">
          { loadingText }
          <LoadingSpinner label={false} />
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
