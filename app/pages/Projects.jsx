import axios from "axios";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Dialog, Toaster, Alert} from "@blueprintjs/core";
import {Link} from "react-router";

import CodeBlockList from "components/CodeBlockList";
import CodeEditor from "components/CodeEditor/CodeEditor";
import CollabSearch from "components/CollabSearch";

import "./Projects.css";

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      deleteAlert: false,
      leaveAlert: false,
      activeTabId: "projects-tab",
      mounted: false,
      execState: false,
      currentProject: null,
      collabProject: null,
      projects: [],
      collabs: []
    };
  }

  componentDidMount() {
    const pget = axios.get("/api/projects/mine");
    const cget = axios.get("/api/projects/collabs");
    const {t} = this.props;

    Promise.all([pget, cget]).then(resp => {
      const projects = resp[0].data;
      const collabs = resp[1].data;

      let {currentProject} = this.state;
      const {filename} = this.props.params;
      if (filename) {
        currentProject = projects.find(p => p.name === filename);
        if (!currentProject) currentProject = projects[0];
        this.setState({currentProject, projects, collabs}, this.openProject.bind(this, currentProject.id));
      }
      else {
        if (projects.length === 0) {
          this.createNewProject.bind(this)(t("My Project"));
        }
        else {
          let latestIndex = 0;
          let latestDate = projects[0].datemodified;
          for (let i = 0; i < projects.length; i++) {
            const p = projects[i];
            if (p.datemodified && Date.parse(p.datemodified) > Date.parse(latestDate)) {
              latestIndex = i;
              latestDate = p.datemodified;
            }
          }
          const currentProject = projects[latestIndex];
          this.setState({currentProject, projects, collabs}, this.openProject.bind(this, currentProject.id));
        }
      }
    });
  }

  openProject(pid) {
    const {browserHistory} = this.context;
    axios.get(`/api/projects/byid?id=${pid}`).then(resp => {
      this.setState({currentProject: resp.data});
      browserHistory.push(`/projects/${this.props.auth.user.username}/${resp.data.name}/edit`);
    });
  }

  setExecState(execState) {
    this.setState({execState});
  }

  createNewProject(projectName) {
    const {browserHistory} = this.context;
    // Trim leading and trailing whitespace from the project title
    projectName = projectName.replace(/^\s+|\s+$/gm, "");
    if (this.state.projects.find(p => p.name === projectName) === undefined && projectName !== "") {
      axios.post("/api/projects/new", {name: projectName, studentcontent: ""}).then(resp => {
        if (resp.status === 200) {
          const projects = resp.data.projects;
          const newid = resp.data.id;
          const currentProject = projects.find(p => p.id === newid);
          this.setState({projectName: "", currentProject, projects});
          browserHistory.push(`/projects/${this.props.auth.user.username}/${currentProject.name}/edit`);
        }
        else {
          alert("Error");
        }
      });
    }
    else {
      alert("File cannot be in use or blank");
    }
  }

  clickNewProject() {
    const {t} = this.props;
    const projectName = this.state.projectName;
    // todo: maybe check with db instead of local state, should check back on this
    if (this.state.changesMade) {
      if (confirm(t("Abandon changes and open new file?"))) {
        this.createNewProject.bind(this, projectName);
      }
      else {
        // do nothing
      }
    }
    else {
      this.createNewProject.bind(this, projectName);
    }
  }

  shareProject() {
    const {t} = this.props;
    const {username} = this.props.auth.user;
    const {browserHistory} = this.context;
    if (this.editor && !this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
      browserHistory.push(`/projects/${username}/${this.state.currentProject.name}`);
    }
    else {
      const toast = Toaster.create({className: "shareToast", position: Position.TOP_CENTER});
      toast.show({message: t("Save your webpage before sharing!"), timeout: 1500, intent: Intent.WARNING});
    }
  }

  showLeaveAlert(collab) {
    const {t} = this.props;
    const leaveAlert = {
      collab,
      text: t("Are you sure you want to leave this project?")
    };
    this.setState({leaveAlert});
  }

  leaveCollab() {
    const {collab} = this.state.leaveAlert;
    const {projects} = this.state;
    if (collab && collab.id) {
      const pid = collab.id;
      axios.post("/api/projects/leavecollab", {pid}).then(resp => {
        if (resp.status === 200) {
          const collabs = this.state.collabs.filter(c => c.id !== collab.id);
          if (collab.id === this.state.currentProject.id) {
            const currentProject = projects[0];
            this.setState({leaveAlert: false, currentProject, collabs}, this.openProject.bind(this, currentProject.id));
          }
          else {
            this.setState({leaveAlert: false, collabs});
          }
        }
        else {
          console.log("error");
        }
      });
    }
  }

  deleteProject(project) {
    const {t} = this.props;
    const {browserHistory} = this.context;

    if (project === true) {
      const {deleteAlert} = this.state;
      axios.delete("/api/projects/delete", {params: {id: deleteAlert.project.id}}).then(resp => {
        if (resp.status === 200) {
          const projects = resp.data;
          let newProject = null;
          // if the project i'm trying to delete is the one i'm currently on, pick a new project
          // to open (in this case, the first one in the list)
          if (deleteAlert.project.id === this.state.currentProject.id) {
            if (projects.length > 0) newProject = projects[0];
          }
          // if the project i'm trying to delete is a different project, it's fine to stay on
          // my current project.
          else {
            newProject = this.state.currentProject;
          }
          this.setState({deleteAlert: false, projectName: "", currentProject: newProject, projects});
          browserHistory.push(`/projects/${this.props.auth.user.username}/${newProject.name}/edit`);
        }
        else {
          console.log("Error");
        }
      });
    }
    else {
      this.setState({deleteAlert: {
        project,
        // text: `Are you sure you want to delete "${ project.name }"? This action cannot be undone.`
        text: t("deleteAlert", {projectName: project.name})
      }});
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
      if (this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
        toast.show({message: t("saveWarning"), timeout: 1500, intent: Intent.WARNING});
      }
      else {
        this.openProject(project.id);
      }
    }
    else {
      this.openProject(project.id);
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

  executeCode() {
    this.editor.getWrappedInstance().getWrappedInstance().executeCode();
  }

  render() {

    const {auth, t} = this.props;
    const {currentProject, deleteAlert, leaveAlert, execState} = this.state;
    const {filename} = this.props.params;
    const {browserHistory} = this.context;

    if (!auth.user) browserHistory.push("/");

    const isMine = currentProject && currentProject.uid === this.props.auth.user.id;
    const hasCollabs = currentProject && currentProject.collaborators.length;
    const showDeleteButton = this.state.projects.length > 1;

    const projectItems = this.state.projects.map(project =>
      <li className="project-switcher-item" key={project.id}>
        <Link
          onClick={() => this.onClickProject.bind(this)(project)}
          className="project-switcher-link link">
          { project.name }
        </Link>
      </li>
    );

    const collabItems = this.state.collabs.map(collab =>
      <li to={collab.id} className="project-switcher-item" key={collab.id}>
        <Link
          onClick={() => this.onClickProject.bind(this)(collab)}
          className="project-switcher-link link">
          { collab.name }
        </Link>
      </li>
    );


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
              { isMine ? <li className="project-action-item">
                <button className="project-action-button u-unbutton link" onClick={() => this.setState({isOpen: true})}>
                  <span className="project-action-button-icon pt-icon pt-icon-people" />
                  <span className="project-action-button-text u-hide-below-xxs">{ !hasCollabs ? t("Project.AddCollaborators") : t("Project.ManageCollaborators") }</span>
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
                {
                  isMine 
                    ? showDeleteButton
                      ? <button className="project-action-button u-unbutton link danger-text" onClick={this.deleteProject.bind(this, currentProject)}>
                        <span className="project-action-button-icon pt-icon pt-icon-trash" />
                        <span className="project-action-button-text u-hide-below-xxs">{t("Project.Delete")}</span>
                      </button>
                      : null
                    : <button className="project-action-button u-unbutton link danger-text" onClick={this.showLeaveAlert.bind(this, currentProject)}>
                      <span className="project-action-button-icon pt-icon pt-icon-log-out" />
                      <span className="project-action-button-text u-hide-below-xxs">{t("Project.Leave") }</span>
                    </button>
                }
              </li> : null }

            </ul>

            {/* project switcher f*/}
            <div className="project-switcher font-xs">

              {/* Switch to project heading */}
              <h2 className="project-switcher-heading font-md">{ t("Project.SwitcherHeading") }</h2>

              {/* created by user */}
              <div className="my-project-switcher">
                <h3 className="project-switcher-subhead font-xs">{ t("Project.MyProjects") }</h3>
                <ul className="project-switcher-list u-list-reset">
                  {projectItems}
                </ul>
              </div>

              {/* joined by user */}
              { collabItems.length > 0
                ? <div className="collab-project-switcher">

                  <h3 className="project-switcher-subhead font-xs">{ t("Project.JoinedProjects") }</h3>

                  <ul className="project-switcher-list u-list-reset">
                    {collabItems}
                  </ul>
                </div>
                : null
              }

              {/* new project */}
              <button className="new-project-button pt-button pt-intent-primary" onClick={() => this.setState({isNewOpen: true})}>
                <span className="pt-icon pt-icon-application" />
                { t("create new project") } 👈
              </button>

            </div>
          </div>

          <Dialog
            icon="inbox"
            isOpen={this.state.isOpen}
            onClose={() => this.setState({isOpen: !this.state.isOpen})}
            title=""
            className="form-container collab-form-container"
          >
            <CollabSearch currentProject={currentProject}/>
          </Dialog>

          <Dialog
            icon="code"
            isOpen={this.state.isNewOpen}
            onClose={() => this.setState({isNewOpen: !this.state.isNewOpen})}
            title={t("Create New Project")}
            className=""
          >
            <div>
              <button>new blank project</button><br/>
              <button>new project from codeblock</button>
            </div>
          </Dialog>

          <Alert
            isOpen={ deleteAlert ? true : false }
            cancelButtonText={ t("Cancel") }
            confirmButtonText={ t("Delete") }
            intent={ Intent.DANGER }
            onCancel={ () => this.setState({deleteAlert: false}) }
            onConfirm={ () => this.deleteProject(true) }>
            <p>{ deleteAlert ? deleteAlert.text : "" }</p>
          </Alert>
          <Alert
            isOpen={ leaveAlert ? true : false }
            cancelButtonText={ t("Cancel") }
            confirmButtonText={ t("Leave") }
            intent={ Intent.DANGER }
            onCancel={ () => this.setState({leaveAlert: false}) }
            onConfirm={ () => this.leaveCollab.bind(this) }>
            <h3>{leaveAlert ? leaveAlert.collab.name : ""}</h3>
            <p>{ leaveAlert ? leaveAlert.text : "" }</p>
          </Alert>

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
