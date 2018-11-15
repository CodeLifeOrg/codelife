import React, {Component} from "react";
import {translate} from "react-i18next";

import "./Contact.css";

/**
 * Contact Component - contains contact information for admins of site
 */

class Contact extends Component {

  render() {
    const {t} = this.props;
    const email = "codelife@codelife.com";

    return (
      <div className="content u-vertical-align-children">
        <div className="form-container u-margin-auto u-text-center">
          <h1 className="u-margin-top-off">{ t("Contact") }</h1>
          <a className="link font-lg" href={`mailto:${email}`}>{email}</a>
        </div>
      </div>
    );
  }
}

export default translate()(Contact);
