import axios from "axios";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Tab2, Tabs2, Toaster} from "@blueprintjs/core";

import CodeBlockList from "components/CodeBlockList";
import ProjectSwitcher from "components/ProjectSwitcher";
import CodeEditor from "components/CodeEditor/CodeEditor";

import "./Projects.css";

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTabId: "projects-tab",
      mounted: false,
      execState: false,
      currentProject: null,
      collabProject: true
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  onCreateProject(project) {
    const {browserHistory} = this.context;
    this.setState({currentProject: project});
    browserHistory.push(`/projects/${this.props.auth.user.username}/${project.name}/edit`);
  }

  onDeleteProject(newproject) {
    const {browserHistory} = this.context;
    this.setState({currentProject: newproject});
    browserHistory.push(`/projects/${this.props.auth.user.username}/${newproject.name}/edit`);
  }

  openProject(pid) {
    const {browserHistory} = this.context;
    axios.get(`/api/projects/byid?id=${pid}`).then(resp => {
      this.setState({currentProject: resp.data[0]});
      browserHistory.push(`/projects/${this.props.auth.user.username}/${resp.data[0].name}/edit`);
    });
  }

  setExecState(execState) {
    this.setState({execState});
  }

  shareProject() {
    const {t} = this.props;
    const {username} = this.props.auth.user;
    const {browserHistory} = this.context;
    if (this.editor && !this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
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
    console.log(project);
    const toast = Toaster.create({className: "blockToast", position: Position.TOP_CENTER});
    if (this.state.currentProject) {
      if (this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
        toast.show({message: t("saveWarning"), timeout: 1500, intent: Intent.WARNING});
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
    const {t} = this.props;
    const {currentProject} = this.state;

    if (currentProject) {
      const id = currentProject.id;
      const name = currentProject.name;
      const studentcontent = this.editor.getWrappedInstance().getWrappedInstance().getEntireContents();
      axios.post("/api/projects/update", {id, name, studentcontent}).then (resp => {
        if (resp.status === 200) {
          const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
          toast.show({message: t("Saved!"), timeout: 1500, intent: Intent.SUCCESS});
          this.editor.getWrappedInstance().getWrappedInstance().setChangeStatus(false);
        }
      });
    }
    else {
      alert("Open a new file first");
    }
  }

  /* handleTabChange(activeTabId) {
    console.log(activeTabId)
    this.setState({activeTabId});
  } */

  executeCode() {
    this.editor.getWrappedInstance().getWrappedInstance().executeCode();
  }

  render() {

    const {auth, t} = this.props;
    const {activeTabId, collabProject, currentProject, titleText, execState} = this.state;
    const {filename} = this.props.params;
    const {browserHistory} = this.context;

    if (!auth.user) browserHistory.push("/");

    const allCodeBlockRef = <CodeBlockList/>;
    const projectRef = <ProjectSwitcher
      projectToLoad={filename}
      onCreateProject={this.onCreateProject.bind(this)}
      onDeleteProject={this.onDeleteProject.bind(this)}
      openProject={this.openProject.bind(this)}
      onClickProject={this.onClickProject.bind(this)}
    />;

    return (
      <div className="projects">

        {/* hidden h1 for accessibility */}
        <h1 className="u-visually-hidden">{ t("Projects") }</h1>


        <div className="project-body">

          {/* controls */}
          <div className="project-controls">

            {/* current file */}
            <h2 className="project-title font-lg">{filename}</h2>

            <h3 className="project-subtitle font-sm">{t("Actions")}</h3>

            {/* list of actions */}
            <ul className="project-action-list font-xs u-list-reset">

              {/* save project */}
              <li className="project-action-item">
                <button className="project-action-button u-unbutton link" onClick={this.saveCodeToDB.bind(this)}>
                  <span className="project-action-button-icon pt-icon pt-icon-floppy-disk" />
                  <span className="project-action-button-text u-hide-below-xxs">{ t("Project.Save") }</span>
                </button>
              </li>

              {/* execute code */}
              { execState ? <li className="project-action-item">
                <button className="project-action-button u-unbutton link" onClick={this.executeCode.bind(this)}>
                  <span className="project-action-button-icon pt-icon pt-icon-refresh" />
                  <span className="project-action-button-text u-hide-below-xxs">{ t("Project.Execute") }</span>
                </button>
              </li> : null }

              {/* add / manage collaborators */}
              { currentProject ? <li className="project-action-item">
                <button className="project-action-button u-unbutton link">
                  <span className="project-action-button-icon pt-icon pt-icon-people" />
                  <span className="project-action-button-text u-hide-below-xxs">{ !collabProject ? t("Project.AddCollaborators") : t("Project.ManageCollaborators") } 👈</span>
                </button>
              </li> : null }

              {/* share project */}
              { currentProject ? <li className="project-action-item">
                <button className="project-action-button u-unbutton link" onClick={this.shareProject.bind(this)}>
                  <span className="project-action-button-icon pt-icon pt-icon-share" />
                  <span className="project-action-button-text u-hide-below-xxs">{ t("Project.Share") }</span>
                </button>
              </li> : null }

              {/* delete / leave project */}
              { currentProject ? <li className="project-action-item">
                <button className="project-action-button u-unbutton link">
                  <span className={ !collabProject ? "project-action-button-icon pt-icon pt-icon-trash" : "project-action-button-icon pt-icon pt-icon-log-out" } />
                  <span className="project-action-button-text u-hide-below-xxs">{ !collabProject ? t("Project.Delete") : t("Project.Leave") } 👈</span>
                </button>
              </li> : null }

            </ul>

            {/* project switcher */}
            <ProjectSwitcher
              projectToLoad={filename}
              onCreateProject={this.onCreateProject.bind(this)}
              onDeleteProject={this.onDeleteProject.bind(this)}
              openProject={this.openProject.bind(this)}
              onClickProject={this.onClickProject.bind(this)} />
          </div>

          {/* editor */}
          <div className="project-editor">
            <CodeEditor
              codeTitle={ currentProject ? currentProject.name : "" } setExecState={this.setExecState.bind(this)}
              initialValue={currentProject ? currentProject.studentcontent : ""}
              ref={c => this.editor = c} />
          </div>
        </div>
      </div>
    );
  }
}

Projects.contextTypes = {
  browserHistory: PropTypes.object
};

Projects = connect(state => ({
  auth: state.auth
}))(Projects);
Projects = translate()(Projects);
export default Projects;
