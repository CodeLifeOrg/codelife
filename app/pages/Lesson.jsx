import axios from "axios";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Lesson.css";
import IslandLink from "components/IslandLink";
import Loading from "components/Loading";

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
      lessons.sort((a, b) => a.ordering - b.ordering);
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

    return (
      <div className="overworld">
        <div className="map">
          { lessonArray.map(lesson => <IslandLink lesson={lesson} />) }
        </div>
      </div>
    );
  }
}

Lesson = connect(state => ({
  auth: state.auth
}))(Lesson);
Lesson = translate()(Lesson);
export default Lesson;
