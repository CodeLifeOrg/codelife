import axios from "axios";
import {connect} from "react-redux";
import {browserHistory, Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";
import CodeBlock from "components/CodeBlock";
import "./Lesson.css";
import Loading from "components/Loading";

class Lesson extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lessons: [],
      snippets: [],
      userProgress: null,
      didInject: false,
      currentFrame: null
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

  toggleDialog(i) {
    const k = `isOpen_${i}`;
    let currentFrame = null;
    if (!this.state[k]) currentFrame = i;
    this.setState({[k]: !this.state[k], didInject: false, currentFrame});
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

  buildButton(lesson, i) {
    const {t} = this.props;
    const {userProgress} = this.state;
    const complete = userProgress.find(up => up.level === lesson.id) !== undefined;
    return (
      <div className="view-snippit">
        <Button className={ complete ? "pt-icon-endorsed" : "" } onClick={this.toggleDialog.bind(this, i)} text={`My ${lesson.name} Codeblock`} />
        <Dialog
          isOpen={this.state[`isOpen_${i}`]}
          onClose={this.toggleDialog.bind(this, i)}
          title={`My ${lesson.name} Snippet`}
          lazy={false}
          inline={false}
          className="codeblock-dialog"
        >
          {/* <div className="pt-dialog-body">{lesson.snippet ? <iframe className="snippetrender" ref={ comp => this.iframes[i] = comp } /> : null}</div>*/}
          <div className="pt-dialog-body">{lesson.snippet ? <CodeBlock lesson={lesson} handleSave={this.handleSave.bind(this)} /> : null}</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button
                intent={Intent.PRIMARY}
                onClick={this.toggleDialog.bind(this, i)}
                text={t("Close")}
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  render() {

    const {t} = this.props;
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
              <div className="title">{ lesson.name }</div>
              <div className="description">{ lesson.description }</div>
            </div>
          </div>
        </Link>;
      }
      return <div className="island" key={ lesson.id }>
        <div className="graphic" to={`/lesson/${lesson.id}`} style={{backgroundImage: `url('/islands/island-${ i + 1 }.png')`}}></div>
        <div className={ `pt-popover pt-tooltip ${ lesson.id }` }>
          <div className="pt-popover-content">
            <span className="pt-icon pt-icon-lock"></span>
            <div className="title">{ lesson.name }</div>
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
