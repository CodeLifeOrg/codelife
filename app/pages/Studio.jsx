import axios from "axios";
import {connect} from "react-redux";
import {Link, browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Toaster} from "@blueprintjs/core";

import AceWrapper from "components/AceWrapper";
import Snippets from "components/Snippets";
import Projects from "components/Projects";

import "./Studio.css";

class Studio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentProject: null,
      currentText: "",
      changesMade: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  onCreateProject(project) {
    this.setState({currentProject: project, currentText: ""}, this.renderText.bind(this));
  }

  onDeleteProject() {
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
    this.setState({currentText: theText, changesMade: true}, this.renderText.bind(this));
  }

  onClickSnippet(snippet) {
    if (this.state.currentProject) this.insertTextAtCursor(snippet.studentcontent);
  }

  openProject(pid) {
    axios.get(`/api/projects/byid?id=${pid}`).then(resp => {
      this.setState({currentText: resp.data[0].studentcontent, currentProject: resp.data[0], changesMade: false}, this.renderText.bind(this));
      browserHistory.push(`/studio/${this.props.user.username}/${resp.data[0].name}`);
    });
  }

  // todo: i'm loading studentcontent twice.  once when we instantiate projects, and then again
  // when you click a project.  I did this so that clicks would respect new writes, but i should
  // find a way to only ever ask for studentcontent once, on-demand only.
  onClickProject(project) {
    if (this.state.currentProject) {
      if (this.state.changesMade) {
        if (confirm("Discard changes and open a new file?")) {
          this.openProject(project.id);
          return true;
        }
        else {
          return false;
        }
      }
      else {
        this.openProject(project.id);
        return true;
      }
    }
    else {
      this.openProject(project.id);
      return true;
    }
  }

  saveCodeToDB() {
    const {id: uid} = this.props.user;
    const {currentText: studentcontent, currentProject} = this.state;

    if (currentProject) {
      const id = currentProject.id;
      const name = currentProject.name;
      axios.post("/api/projects/update", {id, name, uid, studentcontent}).then (resp => {
        if (resp.status === 200) {
          const t = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
          t.show({message: "Saved!", intent: Intent.SUCCESS});
          this.setState({changesMade: false});
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

    const snippetRef = <Snippets onClickSnippet={this.onClickSnippet.bind(this)}/>;
    const projectRef = <Projects  projectToLoad={id}
                                  onCreateProject={this.onCreateProject.bind(this)}
                                  onDeleteProject={this.onDeleteProject.bind(this)}
                                  openProject={this.openProject.bind(this)}
                                  onClickProject={this.onClickProject.bind(this)}/>;

    return (
      <div>
        <h1>{ t("Studio") }</h1>
        {snippetRef}
        {projectRef}
        <div id="container">
          <div id="acecontainer">
          { this.state.mounted ? <AceWrapper height="400px" ref={ comp => this.editor = comp } mode="html" onChange={this.onChangeText.bind(this)} readOnly={!currentProject} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : null }
          <button className="button" onClick={this.saveCodeToDB.bind(this)}>SAVE</button>
          <button className="button" onClick={this.validateHTML.bind(this)}>VALIDATE</button>
          <br/><br/>
          { currentProject ? <Link className="share-link" to={`/share/project/${currentProject.id}`}>Share this Project</Link> : null }
          </div>
          <iframe id="rendercontainer" ref="rc" />
        </div>
        <div className="clear">
          <br/>
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
