import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";

class Lesson extends Component {

  render() {
    
    const {t} = this.props;

    const {tid} = this.props.params;

    // todo - have lessonArray come from json-in-the-sky
    const lessonArray = ["lesson-1", "lesson-2", "lesson-3", "lesson-4"];
    const lessonItems = lessonArray.map(lesson => 
      <li><Link className="link" to={`/topic/${tid}/${lesson}/slide-1`}>{lesson}</Link></li>);

    return (
      <div>
        <h1>{tid} {t("Lessons")}</h1>
        <ul>{lessonItems}</ul>
        <Nav />
      </div>
    );
  }
}

export default translate()(Lesson);
