import axios from "axios";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Dialog, Toaster, Alert, EditableText, Tooltip} from "@blueprintjs/core";
import {Link} from "react-router";

import CodeBlockList from "components/CodeBlockList";
import CodeEditor from "components/CodeEditor/CodeEditor";
import CollabList from "components/CollabList";
import CollabSearch from "components/CollabSearch";

import "components/Studio.css";
import "./Projects.css";

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      deleteAlert: false,
      leaveAlert: false,
      activeTabId: "projects-tab",
      projectName: "",
      mounted: false,
      execState: false,
      currentProject: null,
      currentPreview: null,
      collabProject: null,
      originalTitle: "",
      currentTitle: "",
      canEditTitle: true,
      projects: [],
      collabs: [],
      showCodeblocks: false,
      isViewCollabsOpen: false
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
      this.setState({currentProject: resp.data, currentTitle: resp.data.name, originalTitle: resp.data.name});
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
          this.setState({currentTitle: currentProject.name, originalTitle: currentProject.name, currentProject, projects, isNewOpen: false});
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
    if (this.editor && !this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
      this.setState({isNewOpen: true});
    }
    else {
      const toast = Toaster.create({className: "shareToast", position: Position.TOP_CENTER});
      toast.show({message: t("Save your webpage before starting a new one!"), timeout: 1500, intent: Intent.WARNING});
    }
  }

  shareProject() {
    const {t} = this.props;
    const {username} = this.props.auth.user;
    const {browserHistory} = this.context;
    if (this.editor && !this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
      //browserHistory.push(`/projects/${username}/${this.state.currentProject.name}`);

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
      text: `${t("Are you sure you want to leave")} “${collab.name}”?`
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
          this.setState({deleteAlert: false, projectName: "", currentProject: newProject, currentTitle: newProject.name, originalTitle: newProject.name, projects});
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
      const username = this.props.auth.user.username;
      axios.post("/api/projects/update", {id, username, name, studentcontent}).then (resp => {
        if (resp.status === 200) {
          const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
          toast.show({message: t("Saved!"), timeout: 1500, intent: Intent.SUCCESS});
          this.editor.getWrappedInstance().getWrappedInstance().setChangeStatus(false);
          this.setState({canEditTitle: true});
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

  handleFork(newid, projects) {
    this.setState({projects}, this.openProject.bind(this, newid));
  }

  toggleCodeblocks() {
    this.setState({showCodeblocks: !this.state.showCodeblocks});
  }

  changeProjectName(newName) {
    const {browserHistory} = this.context;
    const {currentProject, projects} = this.state;
    const canEditTitle = false;
    currentProject.name = newName;
    const cp = projects.find(p => p.id === currentProject.id);
    if (cp) cp.name = newName;
    this.setState({currentProject, projects, canEditTitle});
    this.saveCodeToDB.bind(this)();
    browserHistory.push(`/projects/${this.props.auth.user.username}/${newName}/edit`);
  }

  render() {

    const {auth, t} = this.props;
    const {currentProject, canEditTitle, originalTitle, currentTitle, deleteAlert, leaveAlert, execState, showCodeblocks} = this.state;
    // const {filename} = this.props.params;
    const {browserHistory} = this.context;

    if (!auth.user) browserHistory.push("/");

    const isMine = currentProject && currentProject.uid === this.props.auth.user.id;
    const hasCollabs = currentProject && currentProject.collaborators.length;

    // list of collabs, passed to collabList
    let collabsList = [];
    hasCollabs ? collabsList = currentProject.collaborators : null;

    const showDeleteButton = this.state.projects.length > 1;

    const {origin} = this.props.location;
    const {username} = this.props.auth.user;
    const name = currentProject ? currentProject.name : "";
    const shareLink = encodeURIComponent(`${origin}/projects/${username}/${name}`);
    console.log(shareLink);

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
        {/* <Tooltip position={Position.RIGHT} content={`${t("Project Owner - ")}${collab.user.username}`}>
        </Tooltip> */}
      </li>
    );


    return (
      <div className="studio projects-studio">

        <div className="studio-inner">

          {/* hidden h1 for accessibility */}
          <h1 className="u-visually-hidden">{ t("Projects") }</h1>

          {/* body */}
          <div className="studio-body">

            {/* controls */}
            <div className="studio-controls">

              {/* current file */}
              <h2 className="studio-title font-lg">
                <span className="u-visually-hidden">{ t("Current project") }: </span>
                <EditableText
                  value={currentTitle}
                  selectAllOnFocus={true}
                  onChange={t => this.setState({currentTitle: t})}
                  onCancel={() => this.setState({currentTitle: originalTitle})}
                  onConfirm={this.changeProjectName.bind(this)}
                  multiline={true}
                  disabled={!canEditTitle}
                  confirmOnEnterKey={true}
                />
              </h2>

              {/* actions title */}
              <h3 className="studio-subtitle font-sm">{t("Actions")}</h3>

              {/* list of actions */}
              <ul className="studio-action-list font-xs u-list-reset">

                {/* save project */}
                <li className="studio-action-item">
                  <button className="studio-action-button u-unbutton link" onClick={this.saveCodeToDB.bind(this)}>
                    <span className="studio-action-button-icon pt-icon pt-icon-floppy-disk" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ t("Project.Save") }</span>
                  </button>
                </li>

                {/* execute code */}
                <li className="studio-action-item">
                  <button
                    className={ `studio-action-button u-unbutton link ${!execState && " is-disabled"}` }
                    onClick={this.executeCode.bind(this)}
                    tabIndex={!execState && "-1"}>
                    <span className="studio-action-button-icon pt-icon pt-icon-refresh" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ t("Project.Execute") }</span>
                  </button>
                </li>

                {/* add / manage collaborators */}
                { isMine ? <li className="studio-action-item">
                  {/* my project */}
                  <button className="studio-action-button u-unbutton link" onClick={() => this.setState({isOpen: true})}>
                    <span className="studio-action-button-icon pt-icon pt-icon-people" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ !hasCollabs ? t("Project.AddCollaborators") : t("Project.ManageCollaborators") }</span>
                  </button>
                  {/* joined project */}
                </li> : <li className="studio-action-item">
                  <button className="studio-action-button u-unbutton link" onClick={() => this.setState({isViewCollabsOpen: true})}>
                    <span className="studio-action-button-icon pt-icon pt-icon-people" />
                    <span className="studio-action-button-text u-hide-below-xxs">
                      {/* X collaborators */}
                      {hasCollabs} { t(" collaborators")}
                    </span>
                  </button>
                </li> }

                {/* share project */}
                <li className="studio-action-item">
                  <a className="studio-action-button link"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`}
                    target="_blank">
                    <span className="studio-action-button-icon pt-icon pt-icon-share" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ t("Project.Share") }</span>
                  </a>
                </li>

                {/* delete / leave project */}
                { currentProject ? <li className="studio-action-item">
                  {
                    isMine
                      ? showDeleteButton
                        // delete button
                        ? <button className="studio-action-button u-unbutton link danger-text" onClick={this.deleteProject.bind(this, currentProject)}>
                          <span className="studio-action-button-icon pt-icon pt-icon-trash" />
                          <span className="studio-action-button-text u-hide-below-xxs">{t("Project.Delete")}</span>
                        </button>
                        // disabled delete button
                        : <button className="studio-action-button u-unbutton is-disabled link" tabIndex="-1">
                          <span className="studio-action-button-icon pt-icon pt-icon-trash" />
                          <span className="studio-action-button-text u-hide-below-xxs">{t("Project.Delete")}</span>
                        </button>
                      // leave project button
                      : <button className="studio-action-button u-unbutton link danger-text" onClick={this.showLeaveAlert.bind(this, currentProject)}>
                        <span className="studio-action-button-icon pt-icon pt-icon-log-out" />
                        <span className="studio-action-button-text u-hide-below-xxs">{t("Project.Leave") }</span>
                      </button>
                  }
                </li> : null }

              </ul>

              {/* project switcher */}
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
                <button className="new-project-button pt-button pt-intent-primary" onClick={this.clickNewProject.bind(this)}>
                  <span className="pt-icon pt-icon-application" />
                  { t("create new project") }
                </button>

              </div>
            </div>


            {/* editor */}
            <div className="studio-editor">
              <CodeEditor
                codeTitle={ currentProject ? currentProject.name : "" } setExecState={this.setExecState.bind(this)}
                initialValue={currentProject ? currentProject.studentcontent : ""}
                ref={c => this.editor = c} />
            </div>
          </div>
        </div>


        {/* show / hide codeblocks */}
        { !showCodeblocks
          // show the button
          ? <div className="cta u-text-center u-margin-top-lg u-margin-bottom-off">

            <h2 className="cta-heading u-margin-top-off u-margin-bottom-off font-lg">
              { t("Need inspiration?") }
            </h2>

            {/* login | signup button */}
            <button className="cta-button pt-button pt-intent-primary font-md u-margin-top-md" onClick={this.toggleCodeblocks.bind(this)}>
              { t("Browse Codeblocks") }
            </button>
          </div>
          // show the codeblocks
          : <div className="codeblock-browser content u-padding-bottom-off">
            <div className="content-section">
              <h2 className="codeblock-browser-heading u-margin-top-off">{ t("Browse Codeblocks") }
                <button
                  className="codeblock-browser-hide-button u-unbutton u-margin-top-off u-margin-bottom-off"
                  onClick={this.toggleCodeblocks.bind(this)}>
                  <span className="pt-icon pt-icon-eye-off" />
                  <span className="u-visually-hidden">{ t("Hide Codeblocks") }</span>
                </button>
              </h2>
              <CodeBlockList blockFork={this.editor && this.editor.getWrappedInstance().getWrappedInstance().changesMade()} handleFork={this.handleFork.bind(this)} />
            </div>
          </div>
        }


        {/* collab search */}
        <Dialog
          isOpen={this.state.isOpen}
          onClose={() => this.setState({isOpen: !this.state.isOpen})}
          title=""
          className="form-container collab-form-container" >
          <CollabSearch currentProject={currentProject}/>
        </Dialog>

        {/* collab list */}
        <Dialog
          isOpen={this.state.isViewCollabsOpen}
          onClose={() => this.setState({isViewCollabsOpen: !this.state.isViewCollabsOpen})}
          title=""
          className="form-container collab-list-container" >
          <CollabList currentProject={currentProject} />
        </Dialog>

        {/* create new project */}
        <Dialog
          isOpen={this.state.isNewOpen}
          onClose={() => this.setState({isNewOpen: !this.state.isNewOpen})}
          title={t("Create New Project")}
          className="form-container new-project-form-container" >

          {/* input */}
          <div className="field-container">
            <label
              className="heading font-md"
              htmlFor="new-project-title">
              {t("Project name")}
            </label>
            <input
              id="new-project-title"
              className="font-md"
              value={this.state.projectName}
              onChange={e => this.setState({projectName: e.target.value})}
              autoFocus />
          </div>

          {/* submit */}
          <div className="field-container">
            <button
              className="pt-button pt-intent-primary font-md"
              onClick={this.createNewProject.bind(this, this.state.projectName)}>
              <span className="pt-icon pt-icon-application" />
              { t("create new project") }
            </button>
          </div>
        </Dialog>

        {/* confirm delete project */}
        <Alert
          className="alert-container form-container"
          isOpen={ deleteAlert ? true : false }
          cancelButtonText={ t("Cancel") }
          confirmButtonText={ t("Delete") }
          intent={ Intent.DANGER }
          onCancel={ () => this.setState({deleteAlert: false}) }
          onConfirm={ () => this.deleteProject(true) }>
          <p className="font-lg u-margin-top-off u-margin-bottom-md">{ deleteAlert ? deleteAlert.text : "" }</p>
        </Alert>

        {/* confirm leave project */}
        <Alert
          className="alert-container form-container"
          isOpen={ leaveAlert ? true : false }
          cancelButtonText={ t("Cancel") }
          confirmButtonText={ t("Leave") }
          intent={ Intent.DANGER }
          onCancel={ () => this.setState({leaveAlert: false}) }
          onConfirm={this.leaveCollab.bind(this)}>
          <p className="font-lg u-margin-top-off u-margin-bottom-md">{ leaveAlert ? leaveAlert.text : "" }</p>
        </Alert>

      </div>
    );
  }
}

Projects.contextTypes = {
  browserHistory: PropTypes.object
};

Projects = connect(state => ({
  auth: state.auth,
  location: state.location
}))(Projects);
Projects = translate()(Projects);
export default Projects;
