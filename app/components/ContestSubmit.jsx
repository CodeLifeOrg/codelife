import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Toaster, Intent, Position} from "@blueprintjs/core";
import {connect} from "react-redux";
import "./ContestSubmit.css";

class ContestSubmit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      status: {},
      selectedProject: "choose-one",
      description: ""
    };
  }

  componentDidMount() {
    const pget = axios.get("/api/projects/mine");
    const cget = axios.get("/api/contest/status");

    Promise.all([pget, cget]).then(resp => {
      if (resp.every(r => r.status === 200)) {
        const projects = resp[0].data;
        const status = resp[1].data;
        const selectedProject = status.project_id ? status.project_id : "choose-one";
        const description = status.description ? status.description : "";
        this.setState({projects, status, selectedProject, description});
      }
      else {
        console.log("error");
      }
    });
  }

  changeDescription(e) {
    this.setState({description: e.target.value});
  }

  selectProject(e) {
    const project = this.state.projects.find(p => p.id === Number(e.target.value));
    const selectedProject = project ? project.id : "choose-one";
    if (selectedProject) this.setState({selectedProject});
  }

  submit() {
    const {selectedProject, description} = this.state;
    const {t} = this.props;
    if (selectedProject !== "choose-one") {
      const contestPayload = {
        project_id: selectedProject,
        description
      };
      console.log("sending", contestPayload);
      axios.post("/api/contest", contestPayload).then(resp => {
        if (resp.status === 200) {
          const toast = Toaster.create({className: "contestToast", position: Position.TOP_CENTER});
          toast.show({message: t("Your project has been submitted!"), intent: Intent.SUCCESS});
          if (this.props.onSubmit) this.props.onSubmit();
        }
        else {
          console.log("error");
        }
      });
      
    }
    else {
      const toast = Toaster.create({className: "contestToast", position: Position.TOP_CENTER});
      toast.show({message: t("Select a project first!"), intent: Intent.WARNING});
    }
  }

  render() {
    // const {t} = this.props;
    const {projects} = this.state;

    const projectList = projects.map(p =>
      <option key={p.id} value={p.id}>{p.name}</option>
    );

    return (
      <div id="contest-submit-container">
        <div>Select a Project</div>
        <div className="pt-select">
          <select value={this.state.selectedProject} onChange={this.selectProject.bind(this)}>
            <option key="choose-one" value="choose-one">Choose a Project</option>
            {projectList}
          </select>
        </div>
        <div>Describe your Project</div>
        <div>
          <textarea value={this.state.description} onChange={this.changeDescription.bind(this)} />
        </div>
        <div>
          <button className="pt-button pt-intent-success" onClick={this.submit.bind(this)}>Submit</button>
        </div>
      </div>
    );
  }
}

ContestSubmit = connect(state => ({
  user: state.auth.user
}))(ContestSubmit);

export default translate()(ContestSubmit);

