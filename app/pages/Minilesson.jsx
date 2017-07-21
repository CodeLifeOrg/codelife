import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";
import "./Minilesson.css";

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

  buildWindow(content) {
    let buildstr = "";
    buildstr += "<div style='width:700px;'>";
    buildstr += "<div style='font-family:monospace; white-space:pre-wrap; width:340px; float:left;'>";
    buildstr += `${this.htmlEscape(content)}</div>`;
    buildstr += "<div style='width:340px; float:right;'>";
    buildstr += `${content}</div>`;
    buildstr += "</div>";
    console.log(buildstr);
    return buildstr;
  }

  componentDidUpdate() {
    if (this.iframes && this.iframes[this.state.currentFrame] && !this.state.didInject) {
      const {otherSnippets} = this.state;
      const doc = this.iframes[this.state.currentFrame].contentWindow.document;
      doc.open();
      doc.write(this.buildWindow(otherSnippets[this.state.currentFrame].studentcontent));
      doc.close();
      this.setState({didInject: true});
    }
  }

  filterByCity(e) {
    console.log(`would filter by ${e.target.value}`);
  }

  filterBySchool(e) {
    console.log(`would filter by ${e.target.value}`);
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
    return (
      <div>
        <Button onClick={this.toggleDialog.bind(this, i)} text={`${snippet.username}: ${snippet.snippetname}`} />
        <Dialog
          iconName="inbox"
          isOpen={this.state[`isOpen_${i}`]}
          onClose={this.toggleDialog.bind(this, i)}
          title={`${snippet.username}: ${snippet.snippetname}`}
          lazy={false}
          inline={true}
          style={{width: "800px"}}
        >
          <div className="pt-dialog-body">{snippet ? <iframe style={{border: "1px solid black"}}className="snippetrender" frameBorder="0" ref={ comp => this.iframes[i] = comp } /> : null}</div>
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

  render() {

    const {t} = this.props;
    const {lid} = this.props.params;
    const {minilessons, currentLesson, userProgress, otherSnippets} = this.state;

    if (!currentLesson || !minilessons || !userProgress || !otherSnippets) return <h1>Loading...</h1>;

    const minilessonItems = minilessons.map(minilesson =>
      <li key={minilesson.id}><Link className={userProgress.find(up => up.level === minilesson.id) !== undefined ? "ml_link completed" : "ml_link"} to={`/lesson/${lid}/${minilesson.id}`}>{ minilesson.name }</Link></li>);

    const otherSnippetItems = otherSnippets.map((os, i) =>
      <li>{this.buildButton.bind(this)(os, i)}</li>);

    this.iframes = new Array(otherSnippets.length);

    return (
      <div>
        <h1>{currentLesson.name}</h1>
        <p>{currentLesson.description}</p>
        <ul>{minilessonItems}</ul>
        <Link className="editor-link" to={`/editor/${lid}`}>Go to my editor (My Snippet)</Link>
        <br/><br/>
        <strong>Other Snippets</strong><br/>
        <ul>{otherSnippetItems}</ul>
      </div>
    );
  }
}

Minilesson = connect(state => ({
  user: state.auth.user
}))(Minilesson);
Minilesson = translate()(Minilesson);
export default Minilesson;
