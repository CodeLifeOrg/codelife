import axios from "axios";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Tab2, Tabs2, Toaster} from "@blueprintjs/core";

import AceWrapper from "components/AceWrapper";
import AllSnippets from "components/AllSnippets";
import Snippets from "components/Snippets";
import Projects from "components/Projects";

import "./Studio.css";

class Studio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTabId: "projects",
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
    browserHistory.push(`/studio/${this.props.auth.user.username}/${project.name}`);
  }

  onDeleteProject() {
    this.setState({currentProject: null, currentText: ""}, this.renderText.bind(this));
    // todo browserhistory push other project
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
      browserHistory.push(`/studio/${this.props.auth.user.username}/${resp.data[0].name}`);
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

  handleTabChange(activeTabId) {
    this.setState({activeTabId});
  }

  render() {

    const {auth, t} = this.props;
    const {activeTabId, currentProject} = this.state;
    const {id} = this.props.params;

    if (!auth.user) browserHistory.push("/login");

    const snippetRef = <Snippets onClickSnippet={this.onClickSnippet.bind(this)}/>;
    const allSnippetRef = <AllSnippets onClickSnippet={this.onClickSnippet.bind(this)}/>;
    const projectRef = <Projects  projectToLoad={id}
                                  onCreateProject={this.onCreateProject.bind(this)}
                                  onDeleteProject={this.onDeleteProject.bind(this)}
                                  openProject={this.openProject.bind(this)}
                                  onClickProject={this.onClickProject.bind(this)}/>;

    return (
      <div id="studio">
        <div id="head">
          <h1 className="title">{ t("Studio") }</h1>
          <div className="buttons">
            { currentProject ? <a className="pt-button" target="_blank" href={ `/share/project/${currentProject.id}` }>{ t("Share") }</a> : null }
            <button className="pt-button pt-intent-success" onClick={this.saveCodeToDB.bind(this)}>{ t("Save") }</button>
          </div>
        </div>
        <div id="body">
          <Tabs2 className="studio-panel" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
            <Tab2 id="projects" title="Projects" panel={ projectRef } />
            <Tab2 id="my-blocks" title="Code Blocks" panel={ snippetRef } />
            <Tab2 id="other-blocks" title="Other Blocks" panel={ allSnippetRef } />
          </Tabs2>
          { this.state.mounted ? <AceWrapper className="studio-editor" ref={ comp => this.editor = comp } mode="html" onChange={this.onChangeText.bind(this)} showGutter={false} readOnly={!currentProject} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : <div className="studio-editor"></div> }
          <iframe className="studio-render" ref="rc" />
        </div>
      </div>
    );
  }
}

Studio = connect(state => ({
  auth: state.auth
}))(Studio);
Studio = translate()(Studio);
export default Studio;
