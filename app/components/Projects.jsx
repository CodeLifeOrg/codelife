import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import "./Projects.css";

class Projects extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gotUserFromDB: false,
      projects: [],
      projectName: "",
      currentProject: null
    };
  }

  componentDidUpdate() {
    if (this.props.user && !this.state.gotUserFromDB) {
      this.setState({gotUserFromDB: true});
      axios.get(`/api/projects/?uid=${this.props.user.id}`).then(resp => {
        if (resp.data.length > 0) this.setState({projects: resp.data});
      });
    }
  }

  deleteSnippet(project) {
    axios.delete("/api/projects/delete", {params: {id: project.id}}).then(resp => {
      if (resp.status === 200) {
        // todo fix this, this is not a good way to cause a refresh
        this.setState({gotUserFromDB: false});
      } 
      else {
        alert("Error");
      }
    });
  }

  handleChange(e) {
    this.setState({projectName: e.target.value});
  }

  handleClick(project) {
    this.props.onChoose(project);
    // todo fix this, this is not a good way to cause a refresh
    this.setState({currentProject: project, gotUserFromDB: false});
  }

  createNewProject() {
    const projectName = this.state.projectName;
    if (projectName !== "") {
      axios.post("/api/projects/new", {name: projectName, uid: this.props.user.id, studentcontent: ""}).then (resp => {
        if (resp.status === 200) {
          // todo fix this, this is not a good way to cause a refresh
          this.setState({gotUserFromDB: false, projectName: "", currentProject:resp.data});
          this.props.onCreateProject(resp.data);
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
    const projectItems = projectArray.map(project =>
    <li className={project === this.state.currentProject ? "project selected" : "project" } key={project.id} onClick={() => this.handleClick(project)}>{project.name}</li>);

    const projectXs = projectArray.map(project =>
    <li className="x" key={project.id} onClick={() => this.deleteSnippet(project)}>[x]</li>);

    return (
      <div>
        <div id="project-title">My Projects</div>
        <div id="project-container">
          { /* <ul id="x-list">{snippetXs}</ul> */ }
          <ul id="project-list">{projectItems}</ul>   
        </div>
        <div className="clear">
        <form>
          <input className="projectName" type="text" value={this.state.projectName} onChange={this.handleChange.bind(this)} /> 
          <input type="button" value="Create New Project File" onClick={this.createNewProject.bind(this)} /> 
        </form>
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
