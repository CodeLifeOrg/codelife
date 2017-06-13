import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listTracks} from "api";

class Track extends Component {

  render() {
    
    const {t} = this.props;

    // todo - have trackArray come from json-in-the-sky, using id to cherrypick
    //const trackArray = ["track-1", "track-2", "track-3", "track-4"];
    const trackArray = listTracks();
    const trackItems = trackArray.map(track => 
      <li><Link className="link" to={`/track/${track.title}`}>{track.title}</Link></li>);

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
