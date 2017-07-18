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
      // todo: properly load the thing when given a permalink
      /*
      let {currentProject} = this.state;
      console.log(projects);
      if (this.props.projectToLoad) {
        currentProject = projects.find(p => p.name = this.props.projectToLoad);
        this.props.onChoose(currentProject);
        this.setState({currentProject});
      }*/
      this.setState({projects});
    });
  }

  deleteSnippet(project) {
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

  handleChange(e) {
    this.setState({projectName: e.target.value});
  }

  handleClick(project) {
    this.props.onChoose(project);
    this.setState({currentProject: project});
  }

  createNewProject() {
    const projectName = this.state.projectName;
    if (projectName !== "") {
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
          <input type="button" value="Create New Project File" onClick={this.createNewProject.bind(this)} /> 
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
