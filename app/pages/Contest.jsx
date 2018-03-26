import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {Intent} from "@blueprintjs/core";

import "./Contest.css";

class Contest extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      signedUp: false
    };
  }

  render() {
    const {t, signedUp} = this.props;

    return (
      <div className="content contest font-md">

        <h1>Welcome to the Codelife Contest</h1>

        <p>code with your friends and win prizes</p>

        <ul>
          <li>rules</li>
          <li>rules</li>
          <li>rules</li>
        </ul>

        {!signedUp
          // user has not yet signed up for the contest
          ? <Link to="/contest/signup" className="pt-button pt-intent-primary font-md">
            { t("Contest.GetStarted") }
          </Link>
          // user has signed up, and may submit a project
          : <Link to="/contest/submit" className="pt-button pt-intent-primary font-md">
            { t("Contest.SubmitProject") }
          </Link>
        }
      </div>
    );
  }
}

export default translate()(Contest);
