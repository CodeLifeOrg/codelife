import axios from "axios";
import {connect} from "react-redux";
import {Link, browserHistory} from "react-router";
import Nav from "components/Nav";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";
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

  componentDidUpdate() {
    if (this.iframes && this.iframes[this.state.currentFrame] && !this.state.didInject) {
      const {lessons} = this.state;   
      const doc = this.iframes[this.state.currentFrame].contentWindow.document;
      doc.open();
      doc.write(lessons[this.state.currentFrame].snippet.studentcontent);
      doc.close();
      this.setState({didInject: true});
    }
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

  buildButton(lesson, i) {
    return (
      <div>
        <Button onClick={this.toggleDialog.bind(this, i)} text={`My ${lesson.name} Snippet`} />
        <Dialog
          iconName="inbox"
          isOpen={this.state[`isOpen_${i}`]}
          onClose={this.toggleDialog.bind(this, i)}
          title={`My ${lesson.name} Snippet`}
          lazy={false}
          inline={true}
        >
          <div className="pt-dialog-body">{lesson.snippet ? <iframe className="snippetrender" ref={ comp => this.iframes[i] = comp } /> : null}</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button 
                text="Edit Snippet" 
                onClick={this.goToEditor.bind(this, lesson.id)}
              />
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

  render() {

    const {t} = this.props;
    const {lessons, snippets, userProgress} = this.state;
    const {user} = this.props;

    if (lessons === [] || !userProgress) return <h1>Loading...</h1>;

    // clone the array so we don't mess with state
    const lessonArray = lessons.slice(0);

    for (const l of lessonArray) {
      l.snippet = snippets.find(s => s.lid === l.id);
    }

    this.iframes = new Array(lessonArray.length);

    const lessonItems = lessonArray.map((lesson, i) => 
      <li key={lesson.id}>
        <Link className={userProgress.find(up => up.level === lesson.id) !== undefined ? "l_link completed" : "l_link"} 
              to={`/lesson/${lesson.id}`}>{ lesson.name } 
        </Link>
        { lesson.snippet ? <ul><li>{this.buildButton.bind(this)(lesson, i)}</li></ul> : null }
      </li>);

    return (
      <div>
        <h1>{t("Islands")}</h1>
        <p>Welcome Back, {user.username}!</p>
        <ul>{lessonItems}</ul>
        <Nav />
      </div>
    );
  }
}

Lesson = connect(state => ({
  user: state.auth.user
}))(Lesson);
Lesson = translate()(Lesson);
export default Lesson;
