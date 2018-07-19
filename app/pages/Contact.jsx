import React, {Component} from "react";
import {translate} from "react-i18next";

import "./Contact.css";

/**
 * Contact Component - contains contact information for admins of site
 */

class Contact extends Component {

  render() {

    const email = "contato@codelife.com";

    return (
      <div className="contact">

        <a href={`mailto:${email}`}>{email}</a>

      </div>
    );
  }
}

export default translate()(Contact);
