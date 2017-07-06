import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listLessons} from "api";

class Lesson extends Component {

  render() {
    
    const {t} = this.props;

    const lessonArray = listLessons();

    const lessonItems = lessonArray.map(lesson => 
      <li key={lesson.id}><Link className="link" to={`/lesson/${lesson.id}`}>{ lesson.title }</Link></li>);

    return (
      <div>
        <h1>{t("Lessons")}</h1>
        <ul>{lessonItems}</ul>
        <Nav />
      </div>
    );
  }
}

export default translate()(Lesson);
