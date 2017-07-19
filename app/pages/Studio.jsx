import axios from "axios";
import {connect} from "react-redux";
import {Link, browserHistory} from "react-router";
import Nav from "components/Nav";
import React, {Component} from "react";
import {translate} from "react-i18next";

import Snippets from "components/Snippets";
import Projects from "components/Projects";

import "./Studio.css";

class AceWrapper extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/html");
      require("brace/theme/monokai");
      return <Ace ref={editor => this.editor = editor} {...this.props}/>;
    }
    return null;
  }
}

class Studio extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      mounted: false, 
      currentProject: null,
      currentText: ""
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  handleCreateProject(project) {
    // todo: save first, or ask user if they want to save before clearing
    this.setState({currentProject: project, currentText: ""}, this.renderText.bind(this));
  }

  handleDeleteProject() {
    this.setState({currentProject: null, currentText: ""}, this.renderText.bind(this));
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
    this.setState({currentText: this.getEditor().getValue()}, this.renderText.bind(this));
  }

  renderText() {
    const doc = this.refs.rc.contentWindow.document;
    doc.open();
    doc.write(this.getEditor().getValue());
    doc.close();
  }

  onChangeText(theText) {
    this.setState({currentText: theText}, this.renderText.bind(this));
  }

  onClickSnippet(snippet) {
    this.insertTextAtCursor(snippet.studentcontent);
  }

  // todo: i'm loading studentcontent twice.  once when we instantiate projects, and then again
  // when you click a project.  I did this so that clicks would respect new writes, but i should
  // find a way to only ever ask for studentcontent once, on-demand only.
  onClickProject(project) {
    axios.get(`/api/projects/byid?id=${project.id}`).then(resp => {
      this.setState({currentText: resp.data[0].studentcontent, currentProject: resp.data[0]}, this.renderText.bind(this));
      browserHistory.push(`/studio/${this.props.user.username}/${resp.data[0].name}`);
    });
  }

  saveCodeToDB() {
    const {id: uid} = this.props.user;
    const {currentText: studentcontent, currentProject} = this.state;

    if (currentProject) {
      const id = currentProject.id;
      const name = currentProject.name;
      axios.post("/api/projects/update", {id, name, uid, studentcontent}).then (resp => {
        if (resp.status === 200) {
          console.log("saved");
        }
      });
    } 
    else {
      alert("open a new file first");
    }
  }

  validateHTML() {
    const annotations = this.getEditor().getSession().getAnnotations();
    const validationText = {};
    validationText.info = "WARNINGS: \n\n";
    validationText.error = "ERRORS: \n\n";
    for (const a of annotations) {
      validationText[a.type] += `${a.text} \n\n`;
    }
    alert(`${validationText.info} ${validationText.error}`);
  }

  render() {
    
    const {t} = this.props;
    const {currentProject} = this.state;
    const {id} = this.props.params;

    const snippetRef = <Snippets onChoose={this.onClickSnippet.bind(this)}/>;
    const projectRef = <Projects projectToLoad={id} onCreateProject={this.handleCreateProject.bind(this)} onDeleteProject={this.handleDeleteProject.bind(this)} onChoose={this.onClickProject.bind(this)}/>;

    return (  
      <div>
        <h1>{ t("Studio") }</h1>
        {snippetRef}
        {projectRef}
        <div id="container">
          <div id="acecontainer">
          { this.state.mounted ? <AceWrapper ref={ comp => this.editor = comp } mode="html" theme="monokai" onChange={this.onChangeText.bind(this)} readOnly={!currentProject} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : null }
          <button className="button" onClick={this.saveCodeToDB.bind(this)}>SAVE</button>
          <button className="button" onClick={this.validateHTML.bind(this)}>VALIDATE</button>
          <br/><br/>
          { currentProject ? <Link className="share-link" to={`/share/project/${currentProject.id}`}>Share this Project</Link> : null }
          </div>
          <iframe id="rendercontainer" ref="rc" />
        </div>
        <div className="clear">
          <br/>
          <Nav />
        </div>
      </div>
    );
  }
}

Studio = connect(state => ({
  user: state.auth.user
}))(Studio);
Studio = translate()(Studio);
export default Studio;
