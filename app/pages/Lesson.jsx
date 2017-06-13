import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";

class Lesson extends Component {

  render() {
    
    const {t} = this.props;

    // todo - have lessonArray come from json-in-the-sky
    const lessonArray = ["lesson-1", "lesson-2", "lesson-3", "lesson-4"];
    const lessonItems = lessonArray.map(lesson => 
      <li><Link className="link" to={`/lesson/${lesson}`}>{lesson}</Link></li>);

    return (
      <div>
        <h1>{ t("Lessons") }</h1>
        <ul>{lessonItems}</ul>
        <Nav />
      </div>
    );
  }
}

export default translate()(Lesson);
