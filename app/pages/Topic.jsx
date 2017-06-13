import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import { Link } from 'react-router';

class Topic extends Component {

  render() {
    
    const {t} = this.props;

    const {id} = this.props.params

    //todo - have topicArray come from json-in-the-sky, using id to cherrypick
    const topicArray = ["topic-1", "topic-2", "topic-3", "topic-4"];
    const topicItems = topicArray.map((topic) => <li>{topic}</li>);

    return (
      <div>
        <h1>{id}: Topics</h1>
        <ul>{topicItems}</ul>
      </div>
    );
  }
}

export default translate()(Topic);