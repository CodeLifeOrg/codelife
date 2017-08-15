import axios from "axios";
import {connect} from "react-redux";
import {browserHistory, Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Lesson.css";
import Loading from "components/Loading";

import {ICONS} from "consts";

class Lesson extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lessons: [],
      snippets: [],
      userProgress: null
    };
  }

  componentDidMount() {
    const lget = axios.get("/api/lessons/");
    const upget = axios.get("/api/userprogress");
    const sget = axios.get("/api/snippets");

    Promise.all([lget, upget, sget]).then(resp => {
      const lessons = resp[0].data;
      lessons.sort((a, b) => a.index - b.index);
      const userProgress = resp[1].data;
      const snippets = resp[2].data;
      this.setState({lessons, userProgress, snippets});
    });
  }

  hasUserCompleted(milestone) {
    // TODO: this is a blocking short-circuit for August. remove after Beta
    if (milestone === "island-3") return false;
    return this.state.userProgress.find(up => up.level === milestone) !== undefined;
  }

  goToEditor(lid) {
    browserHistory.push(`/editor/${lid}`);
  }

  handleSave(sid, studentcontent) {
    // TODO: i think i hate this.  when CodeBlock saves, I need to change the state of Lesson's snippet array
    // so that subsequent opens will reflect the newly saved code.  In a perfect world, a CodeBlock save would
    // reload all snippets freshly from the database, but I also want to minimize db hits.  revisit this.
    const {snippets} = this.state;
    for (const s of snippets) {
      if (s.id === sid) s.studentcontent = studentcontent;
    }
    this.setState(snippets);
  }

  render() {

    const {lessons, snippets, userProgress} = this.state;

    const {auth} = this.props;

    if (!auth.user) browserHistory.push("/login");

    if (lessons === [] || !userProgress) return <Loading />;

    // clone the array so we don't mess with state
    const lessonArray = lessons.slice(0);

    for (let l = 0; l < lessonArray.length; l++) {
      lessonArray[l].snippet = snippets.find(s => s.lid === lessonArray[l].id);
      const done = this.hasUserCompleted(lessonArray[l].id);
      lessonArray[l].isDone = done;
      lessonArray[l].isNext = l === 0 && !done || l > 0 && !done && lessonArray[l - 1].isDone;
    }

    const lessonItems = lessonArray.map((lesson, i) => {
      if (lesson.isNext || lesson.isDone) {
        let css = "island";
        if (lesson.isNext) css += " next";
        if (lesson.isDone) css += " done";
        return <Link to={`/lesson/${lesson.id}`} className={ css } key={ lesson.id }>
          <div className="graphic" style={{backgroundImage: `url('/islands/island-${ i + 1 }.png')`}}></div>
          <div className={ `pt-popover pt-tooltip ${ lesson.id }` }>
            <div className="pt-popover-content">
              <div className="title">{ ICONS[lesson.id] ? <span className={ `pt-icon-standard pt-icon-${ICONS[lesson.id]}` } /> : null }{ lesson.name }</div>
              <div className="description">{ lesson.description }</div>
            </div>
          </div>
        </Link>;
      }
      return <div className="island" key={ lesson.id }>
        <div className="graphic" to={`/lesson/${lesson.id}`} style={{backgroundImage: `url('/islands/island-${ i + 1 }.png')`}}></div>
        <div className={ `pt-popover pt-tooltip ${ lesson.id }` }>
          <div className="pt-popover-content">
            <div className="title"><span className="pt-icon-standard pt-icon-lock" />{ lesson.name }</div>
            <div className="description">{ lesson.description }</div>
          </div>
        </div>
      </div>;
    });

    return (
      <div className="overworld">
        <div className="map">{lessonItems}</div>
      </div>
    );
  }
}

Lesson = connect(state => ({
  auth: state.auth
}))(Lesson);
Lesson = translate()(Lesson);
export default Lesson;
