import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listLessonsByTrackAndTopic} from "api";

// Lesson Page
// Lists available lessons.  A lesson id, or "lid", is stored in the database.
// The lid is also used as the navigational slug in the URL of the page.

class Lesson extends Component {

  render() {
    
    const {t} = this.props;

    // get the track and topic id from the URL. 
    // We'll need these ids to look up the lessons for this Track/Topic
    const {trid, tid} = this.props.params;

    const lessonArray = listLessonsByTrackAndTopic(trid, tid);
    const lessonItems = lessonArray.map(lesson => 
      <li><Link className="link" to={`/track/${trid}/${tid}/${lesson.lid}/slide-1`}>{ lesson.title }</Link></li>);

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
