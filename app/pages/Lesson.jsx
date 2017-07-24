import axios from "axios";
import {connect} from "react-redux";
import {Link, browserHistory} from "react-router";
import React, {Component} from "react";
import {Interpolate, translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";
import CodeBlock from "components/CodeBlock";
import "./Lesson.css";

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
      this.setState({lessons: resp[0].data, userProgress: resp[1].data, snippets: resp[2].data});
    });
  }

  hasUserCompleted(milestone) {
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
    // todo: i think i hate this.  when CodeBlock saves, I need to change the state of Lesson's snippet array
    // so that subsequent opens will reflect the newly saved code.  In a perfect world, a CodeBlock save would
    // reload all snippets freshly from the database, but I also want to minimize db hits.  revisit this.
    const {snippets} = this.state;
    for (const s of snippets) {
      if (s.id === sid) s.studentcontent = studentcontent;
    }
    this.setState(snippets);
  }

  buildButton(lesson, i) {
    const {userProgress} = this.state;
    const complete = userProgress.find(up => up.level === lesson.id) !== undefined;
    return (
      <div className="view-snippit">
        <Button className={ complete ? "pt-icon-endorsed" : "" } onClick={this.toggleDialog.bind(this, i)} text={`My ${lesson.name} Snippet`} />
        <Dialog
          isOpen={this.state[`isOpen_${i}`]}
          onClose={this.toggleDialog.bind(this, i)}
          title={`My ${lesson.name} Snippet`}
          lazy={false}
          inline={true}
          className="codeblock-dialog"
        >
          {/*<div className="pt-dialog-body">{lesson.snippet ? <iframe className="snippetrender" ref={ comp => this.iframes[i] = comp } /> : null}</div>*/}
          <div className="pt-dialog-body">{lesson.snippet ? <CodeBlock lesson={lesson} handleSave={this.handleSave.bind(this)} /> : null}</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button
                intent={Intent.PRIMARY}
                onClick={this.toggleDialog.bind(this, i)}
                text="Close"
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  islandState(lesson) {
    let css = "island";
    if (lesson.isNext) css += " next";
    lesson.isDone ? css += " completed" : css += " blocked";
    return css;
  }

  render() {

    const {t} = this.props;
    const {lessons, snippets, userProgress} = this.state;
    const {user} = this.props;

    if (lessons === [] || !userProgress) return <h1>Loading...</h1>;

    // clone the array so we don't mess with state
    const lessonArray = lessons.slice(0);

    for (let l = 0; l < lessonArray.length; l++) {
      lessonArray[l].snippet = snippets.find(s => s.lid === lessonArray[l].id);
      const done = this.hasUserCompleted(lessonArray[l].id);
      lessonArray[l].isDone = done;
      lessonArray[l].isNext = l === 0 && !done || l > 0 && !done && lessonArray[l - 1].isDone;
    }

    const lessonItems = lessonArray.map((lesson, i) => {
      return <div className={ this.islandState(lesson) } key={ lesson.id }>
        <Link className="graphic" to={`/lesson/${lesson.id}`} style={{backgroundImage: `url('/islands/island-${ i + 1 }-small.png')`}}></Link>
        { lesson.snippet ? this.buildButton.bind(this)(lesson, i) : null }
      </div>;
    });

    return (
      <div className="overworld">
        <h2 className="welcome"><Interpolate i18nKey="overworld.welcome" name={ user.username } /></h2>
        <div className="map">{lessonItems}</div>
      </div>
    );
  }
}

Lesson = connect(state => ({
  user: state.auth.user
}))(Lesson);
Lesson = translate()(Lesson);
export default Lesson;
