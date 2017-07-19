import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import "./Projects.css";

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
      }
      
    });
  }

  deleteSnippet(project) {
    if (confirm("Are you sure you want to delete this project?")) {
      axios.delete("/api/projects/delete", {params: {id: project.id}}).then(resp => {
        if (resp.status === 200) {
          this.setState({projectName: "", currentProject: null, projects: resp.data}, this.forceUpdate.bind(this));
          this.props.onDeleteProject();
        } 
        else {
          console.log("Error");
        }
      });
    } 
    else {
      // do nothing
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
          this.setState({projectName: "", currentProject: resp.data.currentProject, projects: resp.data.projects}, this.forceUpdate.bind(this));
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

    const projectArray = this.state.projects;
    projectArray.sort((a, b) => a.name < b.name ? -1 : 1);
    const projectItems = projectArray.map(project =>
    <li className={this.state.currentProject && project.id === this.state.currentProject.id ? "project selected" : "project" } key={project.id} onClick={() => this.handleClick(project)}>{project.name}</li>);
    
    const projectXs = projectArray.map(project =>
    <li className="x" key={project.id} onClick={() => this.deleteSnippet(project)}>[x]</li>);

    return (
      <div>
        <div id="project-title">My Projects</div>
        <div id="project-container">
          <ul id="project-x-list">{projectXs}</ul>
          <ul id="project-list">{projectItems}</ul>   
          <div className="clear" />
        </div>
        <form>
          <input className="projectName" type="text" value={this.state.projectName} onChange={this.handleChange.bind(this)} /> 
          <input type="button" value="Create New Project File" onClick={this.clickNewProject.bind(this)} /> 
        </form>
      </div>
    );
  }
}

Projects = connect(state => ({
  user: state.auth.user
}))(Projects);
Projects = translate()(Projects);
export default Projects;
