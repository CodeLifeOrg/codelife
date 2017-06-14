import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listTracks} from "api";

// Track Page
// Lists available Tracks.  A track id, or "trid", is stored in the database.
// The trid is also used as the navigational slug in the URL of the page.

class Track extends Component {

  render() {
    
    const {t} = this.props;

    const trackArray = listTracks();
    const trackItems = trackArray.map(track => 
      <li><Link className="link" to={`/track/${track.trid}`}>{track.title}</Link></li>);

    return (
      <div>
        <h1>{t("Tracks")}</h1>
        <ul>{trackItems}</ul>
        <Nav />
      </div>
    );
  }
}

export default translate()(Track);
