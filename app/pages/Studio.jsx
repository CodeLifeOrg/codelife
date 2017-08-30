import axios from "axios";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Tab2, Tabs2, Toaster} from "@blueprintjs/core";

import AllSnippets from "components/AllSnippets";
import Projects from "components/Projects";
import CodeEditor from "components/CodeEditor";

import "./Studio.css";

class Studio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTabId: "projects",
      mounted: false,
      currentProject: null
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  onCreateProject(project) {
    this.setState({currentProject: project});
    if (this.editor.getWrappedInstance()) this.editor.getWrappedInstance().setEntireContents("");
    browserHistory.push(`/projects/${this.props.auth.user.username}/${project.name}/edit`);
  }

  onDeleteProject(newproject) {
    if (newproject.id !== this.state.currentProject.id) this.editor.getWrappedInstance().setEntireContents(newproject.studentcontent);
    this.setState({currentProject: newproject});
    browserHistory.push(`/projects/${this.props.auth.user.username}/${newproject.name}/edit`);
  }

  onClickSnippet(snippet) {
    if (this.state.currentProject) this.editor.getWrappedInstance().insertTextAtCursor(snippet.studentcontent);
  }

  openProject(pid) {
    axios.get(`/api/projects/byid?id=${pid}`).then(resp => {
      this.setState({currentProject: resp.data[0]});
      this.editor.getWrappedInstance().setEntireContents(resp.data[0].studentcontent);
      browserHistory.push(`/projects/${this.props.auth.user.username}/${resp.data[0].name}/edit`);
    });
  }

  shareProject() {
    const {t} = this.props;
    const {username} = this.props.auth.user;
    if (this.editor && !this.editor.getWrappedInstance().changesMade()) {
      // browserHistory.push(`/share/project/${this.state.currentProject.id}`);  
      browserHistory.push(`/projects/${username}/${this.state.currentProject.name}`);  
    }
    else {
      const toast = Toaster.create({className: "shareToast", position: Position.TOP_CENTER});
      toast.show({message: t("Save your webpage before sharing!"), timeout: 1500, intent: Intent.WARNING});
    }
  }

  // TODO: i'm loading studentcontent twice.  once when we instantiate projects, and then again
  // when you click a project.  I did this so that clicks would respect new writes, but i should
  // find a way to only ever ask for studentcontent once, on-demand only.

  // Also, the return value here is because Projects.jsx needs to know if I clicked confirm or not.

  onClickProject(project) {
    const {t} = this.props;
    const toast = Toaster.create({className: "blockToast", position: Position.TOP_CENTER});
    if (this.state.currentProject) {
      if (this.editor.getWrappedInstance().changesMade()) {
        toast.show({message: t("Save your changes before opening a new webpage."), timeout: 1500, intent: Intent.WARNING});  
        return false;
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
    const {id: uid} = this.props.auth.user;
    const {t} = this.props;
    const {currentProject} = this.state;

    if (currentProject) {
      const id = currentProject.id;
      const name = currentProject.name;
      const studentcontent = this.editor.getWrappedInstance().getEntireContents();
      axios.post("/api/projects/update", {id, name, uid, studentcontent}).then (resp => {
        if (resp.status === 200) {
          const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
          toast.show({message: t("Saved!"), timeout: 1500, intent: Intent.SUCCESS});
          this.editor.getWrappedInstance().setChangeStatus(false);
        }
      });
    }
    else {
      alert("Open a new file first");
    }
  }

  handleTabChange(activeTabId) {
    this.setState({activeTabId});
  }

  executeCode() {
    this.editor.getWrappedInstance().executeCode();
  }

  render() {

    const {auth, t} = this.props;
    const {activeTabId, currentProject, titleText} = this.state;
    const {filename} = this.props.params;

    if (!auth.user) browserHistory.push("/login");

    const allSnippetRef = <AllSnippets onClickSnippet={this.onClickSnippet.bind(this)}/>;
    const projectRef = <Projects  projectToLoad={filename}
                                  onCreateProject={this.onCreateProject.bind(this)}
                                  onDeleteProject={this.onDeleteProject.bind(this)}
                                  openProject={this.openProject.bind(this)}
                                  onClickProject={this.onClickProject.bind(this)}/>;

    return (
      <div id="studio">
        <div id="head">
          <h1 className="title">{ t("Projects") }</h1>
          <div className="title-tab">{titleText}</div>
          <div className="buttons">
            { currentProject ? <span className="pt-button" onClick={this.shareProject.bind(this)}>{ t("Share") }</span> : null }
            <button className="pt-button pt-intent-warning" onClick={this.executeCode.bind(this)}>{ t("Execute") }</button>
            <button className="pt-button pt-intent-success" onClick={this.saveCodeToDB.bind(this)}>{ t("Save") }</button>
          </div>
        </div>
        <div id="body">
          <Tabs2 className="studio-panel" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
            <Tab2 id="projects" title={t("Projects")} panel={ projectRef } />
            <Tab2 id="code-blocks" title={t("CodeBlocks")} panel={ allSnippetRef } />
          </Tabs2>
          <CodeEditor codeTitle={ currentProject ? currentProject.name : "" } ref={c => this.editor = c} />
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
