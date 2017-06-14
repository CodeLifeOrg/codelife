import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listTopicsByTrack} from "api";

// Topic Page
// Lists available topics.  A topic id, or "tid", is stored in the database.
// The tid is also used as the navigational slug in the URL of the page.

class Topic extends Component {

  render() {
    
    const {t} = this.props;

    // get the track id from the URL, because we'll need this to look up this Track's Topics
    const {trid} = this.props.params;

    const topicArray = listTopicsByTrack(trid);
    const topicItems = topicArray.map(topic => 
      <li><Link className="link" to={`/track/${trid}/${topic.tid}`}>{topic.title}</Link></li>);

    return (
      <div>
        <h1>{trid} {t("Topics")}</h1>
        <ul>{topicItems}</ul>
        <Nav />
      </div>
    );
  }
}

export default translate()(Topic);
