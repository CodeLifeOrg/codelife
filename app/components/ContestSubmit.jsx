import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Toaster, Intent, Position} from "@blueprintjs/core";
import "./ContestSubmit.css";

class ContestSubmit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      selectedProject: "choose-one",
      description: ""
    };
  }

  componentDidMount() {
    axios.get("/api/projects/mine").then(resp => {
      const projects = resp.data;
      resp.status === 200 ? this.setState({projects}) : console.log("error");
    });
  }

  changeDescription(e) {
    this.setState({description: e.target.value});
  }

  selectProject(e) {
    console.log(e.target.value);
    const project = this.state.projects.find(p => p.id === Number(e.target.value));
    const selectedProject = project ? project.id : "choose-one";
    if (selectedProject) this.setState({selectedProject});
  }

  submit() {
    const {selectedProject, description} = this.state;
    const {t} = this.props;
    if (selectedProject !== "choose-one") {
      const toast = Toaster.create({className: "contestToast", position: Position.TOP_CENTER});
      toast.show({message: t("Your project has been submitted!"), intent: Intent.SUCCESS});
      console.log("Would send", selectedProject, description);
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

export default translate()(ContestSubmit);
