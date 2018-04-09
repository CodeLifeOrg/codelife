import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import "./Projects.css";

import {Alert, Intent, Tooltip, Position, Icon, Dialog, Button, MenuItem} from "@blueprintjs/core";
import CollabSearch from "./CollabSearch";

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      deleteAlert: false,
      leaveAlert: false,
      projects: [],
      collabs: [],
      projectName: "",
      isOpen: false,
      currentProject: null,
      collabProject: null
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
      if (this.props.projectToLoad) {
        currentProject = projects.find(p => p.name === this.props.projectToLoad);
        if (!currentProject) currentProject = projects[0];
        this.setState({currentProject, projects, collabs}, this.props.openProject.bind(this, currentProject.id));
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
          this.setState({currentProject, projects, collabs}, this.props.openProject.bind(this, currentProject.id));
        }
      }
    });
  }

  deleteProject(project) {
    const {t} = this.props;

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
          this.props.onDeleteProject(newProject);
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

  handleChange(e) {
    this.setState({projectName: e.target.value});
  }

  handleClick(project) {
    if (this.props.onClickProject(project)) this.setState({currentProject: project});
  }

  createNewProject(projectName) {
    // Trim leading and trailing whitespace from the project title
    projectName = projectName.replace(/^\s+|\s+$/gm, "");
    if (this.state.projects.find(p => p.name === projectName) === undefined && projectName !== "") {
      axios.post("/api/projects/new", {name: projectName, studentcontent: ""}).then(resp => {
        if (resp.status === 200) {
          const projects = resp.data.projects;
          this.setState({projectName: "", currentProject: resp.data.currentProject, projects});
          this.props.onCreateProject(resp.data.currentProject);
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
            this.setState({leaveAlert: false, currentProject, collabs}, this.props.openProject.bind(this, currentProject.id));
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

  clickNewProject() {
    const {t} = this.props;
    const projectName = this.state.projectName;
    // todo: maybe check with db instead of local state, should check back on this
    if (this.state.changesMade) {
      if (confirm(t("Abandon changes and open new file?"))) {
        this.createNewProject(projectName);
      }
      else {
        // do nothing
      }
    }
    else {
      this.createNewProject(projectName);
    }
  }

  toggleCollab() {

  }

  toggleDialog(project) {
    this.setState({isOpen: !this.state.isOpen, collabProject: project});
  }

  // ============================================
  // BEGIN MULTISELECT
  // ============================================

  renderUser(obj) {
    const {item, handleClick} = obj;
    return (
      <MenuItem
        icon={this.isUserSelected(item) ? "tick" : "blank"}
        key={item.id}
        label={item.name}
        onClick={handleClick}
        text={item.name}
        shouldDismissPopover={false}
      />
    );
  }

  isUserSelected(user) {
    return this.state.users.indexOf(user) !== -1;
  }

  handleUserSelect(user) {
    !this.isUserSelected(user) ? this.selectUser(user) : this.deselectUser(this.getSelectedUserIndex(user));
  }

  getSelectedUserIndex(user) {
    return this.state.users.indexOf(user);
  }

  selectUser(user) {
    this.setState({users: [...this.state.users, user]});
  }

  deselectUser(index) {
    this.setState({users: this.state.users.filter((_user, i) => i !== index)});
  }

  filterUser(query, user) {
    return user.name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  }

  handleTagRemove(_tag, index) {
    this.deselectUser(index);
  }

  // ============================================
  // END MULTISELECT
  // ============================================

  render() {

    const {t} = this.props;
    const {deleteAlert, leaveAlert} = this.state;

    const showDeleteButton = this.state.projects.length > 1;

    const projectArray = this.state.projects;
    const projectItems = projectArray.map(project =>
      <li className={this.state.currentProject && project.id === this.state.currentProject.id ? "project selected" : "project" } key={project.id}>

        {
          project.collaborators.length
            ? <Tooltip position={Position.TOP_LEFT} content={ `${t("Collaborators")}: ${project.collaborators.map(c => c.user.username).join(" ")}` }>
              <div><span className="project-title" onClick={() => this.handleClick(project)}>{project.name}</span>&nbsp;<Icon iconName="people" /></div>
            </Tooltip>
            : <span className="project-title" onClick={() => this.handleClick(project)}>{project.name}</span>
        }
        <div>
          <Tooltip content={ "Add Collaborator" }>
            <div>
              <span className="pt-icon-standard pt-icon-plus" onClick={this.toggleDialog.bind(this, project)} />
              <Dialog
                icon="inbox"
                isOpen={this.state.isOpen}
                onClose={this.toggleDialog.bind(this)}
                title=""
                className="form-container collab-form-container"
              >
                <CollabSearch projects={this.state.projects} currentProject={this.state.collabProject}/>
              </Dialog>
            </div>
          </Tooltip>&nbsp;&nbsp;&nbsp;
          { showDeleteButton
            ? <Tooltip content={ t("Delete Project") }>
              <span className="pt-icon-standard pt-icon-trash" onClick={ () => this.deleteProject(project) }></span>
            </Tooltip>
            : null
          }
        </div>
      </li>);

    const collabItems = this.state.collabs.map(collab =>
      <li className={this.state.currentProject && collab.id === this.state.currentProject.id ? "project selected" : "project" } key={collab.id}>
        <Tooltip position={Position.TOP_LEFT} content={ `${t("Owner")}: ${collab.username}` }>
          <div><span className="project-title" onClick={() => this.handleClick(collab)}>{collab.name}</span>&nbsp;<Icon iconName="people" /></div>
        </Tooltip>
        <Tooltip position={Position.TOP_RIGHT} content={ `${t("Leave Project")}` }>
          <span className="pt-icon-standard pt-icon-log-out" onClick={() => this.showLeaveAlert(collab)}></span>
        </Tooltip>
      </li>);

    return (
      <div id="projects">
        <div className="project-new">
          <div className="project-new-title">{t("Create a New Project")}</div>
          <div className="project-new-form">
            <input className="pt-input project-new-filename" type="text" value={this.state.projectName} placeholder={ t("Project Title") } onChange={this.handleChange.bind(this)} />
            <button className="pt-button" onClick={this.clickNewProject.bind(this)}>{ t("Create") }</button>
          </div>
        </div>
        <ul className="project-list">
          {projectItems}
          { collabItems ? <hr/> : null /* not working ¯\_(ツ)_/¯ */ }
          {collabItems}
        </ul>
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
          onConfirm={ () => this.leaveCollab() }>
          <h3>{leaveAlert ? leaveAlert.collab.name : ""}</h3>
          <p>{ leaveAlert ? leaveAlert.text : "" }</p>
        </Alert>
      </div>
    );
  }
}

Projects = connect(state => ({
  user: state.auth.user
}))(Projects);
Projects = translate()(Projects);
export default Projects;
