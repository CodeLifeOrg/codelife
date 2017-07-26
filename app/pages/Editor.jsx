import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import AceWrapper from "components/AceWrapper";
import "./Editor.css";

import Loading from "components/Loading";

class Editor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      lesson: null,
      snippet: null
    };
  }

  componentDidMount() {
    const {lid} = this.props.params;

    const sget = axios.get(`/api/snippets/bylid?lid=${lid}`);
    const lget = axios.get(`/api/lessons?id=${lid}`);

    Promise.all([sget, lget]).then(resp => {
      if (resp[0].data.length > 0) {
        this.setState({mounted: true, lesson: resp[1].data[0], snippet: resp[0].data[0], currentText: resp[0].data[0].studentcontent}, this.renderText.bind(this));
      }
      else {
        this.setState({mounted: true, lesson: resp[1].data[0], currentText: resp[1].data[0].initialcontent}, this.renderText.bind(this));
      }
    });
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  grabContents() {
    return this.state.currentText;
  }

  renderText() {
    const doc = this.refs.rc.contentWindow.document;
    doc.open();
    doc.write(this.state.currentText);
    doc.close();
  }

  onChangeText(theText) {
    this.setState({currentText: theText}, this.renderText.bind(this));
  }

  resetSnippet() {
    const {lesson} = this.state;
    if (lesson) this.setState({currentText: lesson.initialcontent}, this.renderText.bind(this));
  }

  saveCodeToDB() {
    const {id: uid} = this.props.user;
    const {currentText: studentcontent, snippet} = this.state;
    const {lid} = this.props.params;
    const name = `My ${this.state.lesson.name} Snippet`;

    let endpoint = "/api/snippets/";
    snippet ? endpoint += "update" : endpoint += "new";
    axios.post(endpoint, {uid, lid, name, studentcontent}).then(resp => {
      if (resp.status === 200) {
        if (!snippet) this.setState({snippet: resp.data});
        alert("Saved to DB");
      }
      else {
        alert("Error");
      }
    });
  }

  validateHTML() {

    /*
    const annotations = this.getEditor().getSession().getAnnotations();
    const validationText = {};
    validationText.info = "WARNINGS: \n\n";
    validationText.error = "ERRORS: \n\n";
    for (const a of annotations) {
      validationText[a.type] += `${a.text} \n\n`;
    }
    alert(`${validationText.info} ${validationText.error}`);
    */

  }

  render() {

    const {t} = this.props;
    const {lid} = this.props.params;
    const {lesson, snippet} = this.state;

    if (!this.state.mounted) return <Loading />;

    return (
      <div>
        <h1>{ "Editor" }</h1>
        <div id="container">
          <div id="acecontainer">
          { this.state.mounted ? <AceWrapper ref={ comp => this.editor = comp } mode="html" onChange={this.onChangeText.bind(this)} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : null }
          <button className="button" key="save" onClick={this.saveCodeToDB.bind(this)}>SAVE</button>
          <button className="button" key="reset" onClick={this.resetSnippet.bind(this)}>RESET</button>
          <br/><br/>
          { snippet ? <Link className="share-link" to={`/share/snippet/${snippet.id}`}>Share this Snippet</Link> : null }
          <br/><br/>
          <Link className="lesson-link" to={`/lesson/${lid}`}>Back to {lesson.name}</Link>
          </div>
          <iframe id="rendercontainer" ref="rc" />
        </div>
        <div className="clear" />
      </div>
    );
  }
}

Editor = connect(state => ({
  user: state.auth.user
}))(Editor);
Editor = translate()(Editor);
export default Editor;
