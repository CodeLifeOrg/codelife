import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import { Link } from 'react-router';

class Topic extends Component {

  render() {
    
    const {t} = this.props;

    //todo - have topicArray come from json-in-the-sky
    const topicArray = ["topic-1", "topic-2", "topic-3", "topic-4"];
    const topicItems = topicArray.map((lesson) => <li>{topic}</li>);

    return (
      <div>
        <h1>Topics</h1>
        <ul>{topicItems}</ul>
      </div>
    );
  }
}

export default translate()(Topic);