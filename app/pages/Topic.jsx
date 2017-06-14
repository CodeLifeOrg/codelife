import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listTopicsByTrack} from "api";

class Topic extends Component {

  render() {
    
    const {t} = this.props;

    const {trid} = this.props.params;

    // todo - have topicArray come from json-in-the-sky, using id to cherrypick
    // const topicArray = ["topic-1", "topic-2", "topic-3", "topic-4"];
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
