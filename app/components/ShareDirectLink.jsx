import React, {Component} from "react";
import Clipboard from "react-clipboard.js";
import {Popover} from "@blueprintjs/core";
import {translate} from "react-i18next";

import "components/ShareDirectLink.css";

class ShareDirectLink extends Component {
  constructor(props) {
    super(props);
    this.onSuccess = this.onSuccess.bind(this);
    this.state = {
      copied: false
    };
  }

  onSuccess() {
    this.setState({copied: true});
  }

  render() {
    const {link, t} = this.props;
    const {copied} = this.state;
    // convert the link into a link that works
    const linkUrl = link.replace(/%3A/g, ":").replace(/%2F/g, "/");
    // chop off http:// for display purposes
    const prettifiedLink = linkUrl.replace("http://", "");

    // default popover text: ctl+c to copy
    let copiedPopoverText = t("ShareDirectLink.CopyInstructions");
    // success popover text: link copied!
    copied ? copiedPopoverText = t("ShareDirectLink.Copied") : null;

    return (
      <div className="share-link-popover font-sm">

        {/* Direct link label: */}
        <p className="share-link-label">{ t("ShareDirectLink.Label") }: </p>

        {/* popover trigger */}
        <Popover
          className="share-link-popover-trigger"
          popoverClassName="share-link-popover"
          content={ copiedPopoverText }
          openOnTargetFocus="false"
          isOpen={ copied && true } >

          {/* clickable link for the copying */}
          <Clipboard
            component="a"
            data-clipboard-text={ linkUrl }
            className="share-link link"
            onSuccess={ this.onSuccess } >
            { prettifiedLink }
          </Clipboard>

        </Popover>
      </div>
    );
  }
}

ShareDirectLink = translate()(ShareDirectLink);
export default ShareDirectLink;
