import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import "./Projects.css";

import {Alert, Intent, Tooltip} from "@blueprintjs/core";

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      deleteAlert: false,
      projects: [],
      projectName: "",
      currentProject: null
    };
  }

  componentDidMount() {
    axios.get("/api/projects/").then(resp => {
      const projects = resp.data;
      let {currentProject} = this.state;
      if (this.props.projectToLoad) {
        currentProject = projects.find(p => p.name === this.props.projectToLoad);
        this.setState({currentProject, projects}, this.props.openProject(currentProject.id));
      }
      else {
        this.setState({projects});
        if (projects.length === 0) {
          this.createNewProject("mypage.html");
        }
      }

    });
  }

  deleteProject(project) {

    if (project === true) {
      const {deleteAlert} = this.state;
      axios.delete("/api/projects/delete", {params: {id: deleteAlert.project.id}}).then(resp => {
        if (resp.status === 200) {
          const projects = resp.data;
          let newProject = null;
          // if the project i'm trying to delete is the one i'm currently on, pick a new project
          // to open (in this case, the first one in the list)
          if (deleteAlert.project.id === this.state.currentProject.id) {
            projects.sort((a, b) => a.name < b.name ? -1 : 1);
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
        text: `Are you sure you want to delete "${ project.name }"? This action cannot be undone.`
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
    if (this.state.projects.find(p => p.name === projectName) === undefined && projectName !== "") {
      axios.post("/api/projects/new", {name: projectName, studentcontent: ""}).then (resp => {
        if (resp.status === 200) {
          const projects = resp.data.projects;
          projects.sort((a, b) => a.name < b.name ? -1 : 1);
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

  clickNewProject() {
    const projectName = this.state.projectName;
    // todo: maybe check with db instead of local state, should check back on this
    if (this.state.changesMade) {
      if (confirm("Abandon changes and open new file?")) {
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

  render() {

    const {t} = this.props;
    const {deleteAlert} = this.state;

    const projectArray = this.state.projects;
    projectArray.sort((a, b) => a.name < b.name ? -1 : 1);
    const projectItems = projectArray.map(project =>
      <li className={this.state.currentProject && project.id === this.state.currentProject.id ? "project selected" : "project" } key={project.id}>
        <span className="project-title" onClick={() => this.handleClick(project)}>{project.name}</span>
        <Tooltip content={ t("Delete Project") }>
          <span className="pt-icon-standard pt-icon-trash" onClick={ () => this.deleteProject(project) }></span>
        </Tooltip>
      </li>);

    return (
      <div id="projects">
        <ul className="project-list">
          {projectItems}
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
        <div className="project-new">
          <div className="project-new-title">Create a New Project</div>
          <div className="project-new-form">
            <input className="pt-input project-new-filename" type="text" value={this.state.projectName} placeholder={ t("Project Title") } onChange={this.handleChange.bind(this)} />
            <button className="pt-button" onClick={this.clickNewProject.bind(this)}>{ t("Create") }</button>
          </div>
        </div>
      </div>
    );
  }
}

Projects = connect(state => ({
  user: state.auth.user
}))(Projects);
Projects = translate()(Projects);
export default Projects;
