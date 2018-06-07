import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import IslandLink from "components/IslandLink";
import "./HomeHeaderLoggedIn.css";

class HomeHeaderLoggedIn extends Component {

  constructor() {
    super();
  }

  render() {
    const {current, progress, t} = this.props;

    return (
      <div className="header home-header logged-in-home-header u-text-center">
        <div className="header-inner header-half-container">

          {/* text */}
          <h1 className="header-headline font-xxl">
            { progress.length ? t("Home.ContinueAdventure") : t("Home.BeginAdventure") }
          </h1>

          {/* island */}
          <IslandLink key={current.id} island={current} heading={false} />

        </div>
      </div>
    );
  }
}

export default translate()(HomeHeaderLoggedIn);
