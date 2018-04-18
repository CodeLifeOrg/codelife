import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import {Alert, Intent, Dialog} from "@blueprintjs/core";
import CollabSearch from "./CollabSearch";

import "./ProjectSwitcher.css";

class ProjectSwitcher extends Component {

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



  render() {

    const {auth, t} = this.props;
    const {deleteAlert, leaveAlert} = this.state;

    const showDeleteButton = this.state.projects.length > 1;

    const projectArray = this.state.projects;
    const projectItems = projectArray.map(project =>
      <li className="project-switcher-item" key={project.id}>
        <Link
          to={`/projects/${auth.user.username}/${project.name}/edit`}
          onClick={() => this.handleClick(project)}
          className="project-switcher-link link">
          { project.name }
        </Link>
      </li>

      /* <li className={this.state.currentProject && project.id === this.state.currentProject.id ? "project selected" : "project" } key={project.id}>

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
          </Tooltip>
          { showDeleteButton
            ? <Tooltip content={ t("Delete Project") }>
              <span className="pt-icon-standard pt-icon-trash" onClick={ () => this.deleteProject(project) }></span>
            </Tooltip>
            : null
          }
        </div>
      </li> */
    );

    const collabItems = this.state.collabs.map(collab =>
      <li to={collab.id} className="project-switcher-item" key={collab.id}>
        <Link
          to={`/projects/${auth.user.username}/${collab.name}/edit`}
          onClick={() => this.handleClick(collab)}
          className="project-switcher-link link">
          { collab.name }
        </Link>
      </li>

      /* <li className={this.state.currentProject && collab.id === this.state.currentProject.id ? "project selected" : "project" } key={collab.id}>
        <Tooltip position={Position.TOP_LEFT} content={ `${t("Owner")}: ${collab.username}` }>
          <div><span className="project-title" onClick={() => this.handleClick(collab)}>{collab.name}</span>&nbsp;<Icon iconName="people" /></div>
        </Tooltip>
        <Tooltip position={Position.TOP_RIGHT} content={ `${t("Leave Project")}` }>
          <span className="pt-icon-standard pt-icon-log-out" onClick={() => this.showLeaveAlert(collab)}></span>
        </Tooltip> */
    );

    return (
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
        <button className="new-project-button pt-button pt-intent-primary">
          <span className="pt-icon pt-icon-application" />
          { t("create new project") } 👈
        </button>

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

ProjectSwitcher = connect(state => ({
  auth: state.auth,
  user: state.auth.user
}), null, null, {withRef: true})(ProjectSwitcher);
ProjectSwitcher = translate(undefined, {withRef: true})(ProjectSwitcher);
export default ProjectSwitcher;
