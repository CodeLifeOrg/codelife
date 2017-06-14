import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listLessonsByTrackAndTopic} from "api";

class Lesson extends Component {

  render() {
    
    const {t} = this.props;

    const {trid, tid} = this.props.params;

    const lessonArray = listLessonsByTrackAndTopic(trid, tid);
    const lessonItems = lessonArray.map(lesson => 
      <li><Link className="link" to={`/track/${trid}/${tid}/${lesson.lid}/slide-1`}>{lesson.title}</Link></li>);

    return (
      <div>
        <h1>{trid} {tid} {t("Lessons")}</h1>
        <ul>{lessonItems}</ul>
        <Nav />
      </div>
    );
  }
}

export default translate()(Lesson);
