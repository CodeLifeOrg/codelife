import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent, Tooltip} from "@blueprintjs/core";
import "./Minilesson.css";

import Loading from "components/Loading";

class Minilesson extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minilessons: null,
      currentLesson: null,
      userProgress: null,
      otherSnippets: null,
      currentFrame: null
    };
  }

  componentDidMount() {
    const {lid} = this.props.params;
    const mlget = axios.get(`/api/minilessons?lid=${lid}`);
    const lget = axios.get(`/api/lessons?id=${lid}`);
    const uget = axios.get("/api/userprogress");
    const osget = axios.get(`/api/snippets/othersbylid?lid=${lid}`);

    Promise.all([mlget, lget, uget, osget]).then(resp => {
      this.setState({
        minilessons: resp[0].data,
        currentLesson: resp[1].data[0],
        userProgress: resp[2].data,
        otherSnippets: resp[3].data
      });
    });
  }

  componentDidUpdate() {
    if (this.iframes && this.iframes[this.state.currentFrame] && !this.state.didInject) {
      const {otherSnippets} = this.state;
      const doc = this.iframes[this.state.currentFrame].contentWindow.document;
      doc.open();
      doc.write(otherSnippets[this.state.currentFrame].studentcontent);
      doc.close();
      this.setState({didInject: true});
    }
  }

  hasUserCompleted(milestone) {
    return this.state.userProgress.find(up => up.level === milestone) !== undefined;
  }

  buildWindow(i, content) {
    const {lid} = this.props.params;
    const done = this.hasUserCompleted(lid);
    return (
      <div className="snippet-popup-container">
        <div className={done ? "snippet-popup-code regular-text" : "snippet-popup-code blurry-text"}>{content}</div>
        <div className="snippet-popup-render">
          <iframe className="snippetrender" frameBorder="0" ref={ comp => this.iframes[i] = comp } />
        </div>
        {!done ? <div className="finish-text">Complete this island to view source from other students!</div> : null}
      </div>
    );
  }

  toggleDialog(i) {
    const k = `isOpen_${i}`;
    let currentFrame = null;
    if (!this.state[k]) currentFrame = i;
    this.setState({[k]: !this.state[k], didInject: false, viewingSource: false, currentFrame});
  }

  htmlEscape(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
  }

  buildButton(snippet, i) {
    const {t} = this.props;
    return (
      <div className="snippet-link">
        <div className="box" onClick={this.toggleDialog.bind(this, i)}>
          <div className="snippet-title">{ snippet.snippetname }</div>
          <div className="author">{ t("created by") } { snippet.username }</div>
        </div>
        <Dialog
          isOpen={this.state[`isOpen_${i}`]}
          onClose={this.toggleDialog.bind(this, i)}
          title={ snippet.snippetname }
          lazy={false}
          inline={true}
          style={{
            "height": "75vh",
            "max-height": "600px",
            "max-width": "800px",
            "width": "100%"
          }}
        >
          <div className="pt-dialog-body">{snippet ? this.buildWindow(i, snippet.studentcontent) : null}</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-byline">{ t("created by") } { snippet.username }</div>
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

  render() {

    const {t} = this.props;
    const {lid} = this.props.params;
    const {minilessons, currentLesson, userProgress, otherSnippets} = this.state;

    if (!currentLesson || !minilessons || !userProgress || !otherSnippets) return <Loading />;

    // clone minilessons as to not mess with state
    const minilessonStatuses = minilessons.slice(0);
    for (let m = 0; m < minilessonStatuses.length; m++) {
      const done = this.hasUserCompleted(minilessonStatuses[m].id);
      minilessonStatuses[m].isDone = done;
      // if i'm the first lesson and i'm not done, i'm next lesson
      // if i'm past the first lesson and i'm not done but my previous one is, i'm the next lesson
      minilessonStatuses[m].isNext = m === 0 && !done || m > 0 && !done && minilessonStatuses[m - 1].isDone;
    }

    const minilessonItems = minilessonStatuses.map(minilesson => {
      const {lid} = this.props.params;
      if (minilesson.isNext || minilesson.isDone) {
        let css = "stop";
        if (minilesson.isNext) css += " next";
        else if (minilesson.isDone) css += " done";
        return <Tooltip content={ minilesson.name } tooltipClassName={ currentLesson.id }>
          <Link className={css} to={`/lesson/${lid}/${minilesson.id}`}></Link>
        </Tooltip>;
      }
      return <div className="stop"></div>;
    });

    const otherSnippetItems = otherSnippets.map((os, i) => this.buildButton.bind(this)(os, i));

    this.iframes = new Array(otherSnippets.length);

    return (
      <div id="island" className={ currentLesson.id }>
        <div className="image">
          <h1 className="title">{ currentLesson.name }</h1>
          <p className="description">{ currentLesson.description }</p>
          <div id="path">
            { minilessonItems }
            <Tooltip content="Final Test" tooltipClassName={ currentLesson.id }>
              <Link className="stop editor-link" to={`/editor/${lid}`}></Link>
            </Tooltip>
          </div>
        </div>
        { otherSnippets.length
        ? <div>
            <h2 className="title">Other Students Snippets</h2>
            <div id="snippets">
              { otherSnippetItems }
            </div>
          </div>
        : null }
      </div>
    );
  }
}

Minilesson = connect(state => ({
  user: state.auth.user
}))(Minilesson);
Minilesson = translate()(Minilesson);
export default Minilesson;
