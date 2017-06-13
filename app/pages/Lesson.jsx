import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import { Link } from 'react-router';

class Lesson extends Component {

  render() {
    
    const {t} = this.props;

    //todo - have lessonArray come from json-in-the-sky
    const lessonArray = ["lesson-1", "lesson-2", "lesson-3", "lesson-4"];
    const lessonItems = lessonArray.map((lesson) => 
      <li><Link className="link" to={`/lesson/${lesson}`}>{lesson}</Link></li>);

    return (
      <div>
        <h1>Lessons</h1>
        <ul>{lessonItems}</ul>
      </div>
    );
  }
}

export default translate()(Lesson);