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

  submit(event) {
    event.preventDefault(); // prevent page reload
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
    const {t} = this.props;
    const {projects} = this.state;

    const projectList = projects.map(p =>
      <option key={p.id} value={p.id}>{p.name}</option>
    );

    return (
      <div className="contest-submit-container">

        {/* heading */}
        <h2 className="signup-heading font-xl">{ t("Contest.ProjectSubmit") }</h2>

        {/* submission form */}
        <form onSubmit={this.submit.bind(this)} className="contest-form-inner">

          {/* select project */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="contest-project-select">{ t("Contest.ProjectSelectLabel") }</label>
            <div className="pt-select">
              <select className="field-input"
                id="contest-project-select"
                value={this.state.selectedProject}
                onChange={this.selectProject.bind(this)}
                autoFocus>
                <option key="choose-one" value="choose-one"></option>
                {projectList}
              </select>
            </div>
            {/* <span className="field-icon pt-icon pt-icon-application" /> */}
          </div>

          {/* description */}
          <div className="field-container font-md">
            <label className="font-sm" htmlFor="contest-project-description">{ t("Contest.ProjectDescriptionLabel") }</label>
            <textarea className="field-input"
              id="contest-project-description"
              value={this.state.description}
              name="description"
              onChange={this.changeDescription.bind(this)} />
          </div>

          {/* submit */}
          <div className="field-container">
            <button type="submit" className="pt-button pt-fill pt-intent-primary font-md">
              <span className="pt-icon pt-icon-application" />
              { t("Contest.SubmitProjectButton") }
            </button>
          </div>
        </form>
      </div>
    );
  }
}

ContestSubmit = connect(state => ({
  user: state.auth.user
}))(ContestSubmit);

export default translate()(ContestSubmit);
