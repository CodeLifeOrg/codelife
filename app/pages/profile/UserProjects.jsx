import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import Constants from "utils/Constants.js";
import ProjectCard from "components/ProjectCard";
import "./Profile.css";

/**
 * Class component for displaying lists of user's projects.
 * This is shown on the public profile for a user and requires sending
 * 1 prop: a ref to the user
 */
class UserProjects extends Component {

  /**
   * Creates the UserProjects component with initial state.
   * @param {boolean} loading - true by defaults gets flipped post AJAX.
   * @param {array} projects - Gets set by AJAX call from DB call.
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      projects: [],
      reports: []
    };
  }

  /**
   * Grabs user id from user prop, makes AJAX call to server and returns
   * the list of projects.
   */
  componentDidMount() {
    const {user} = this.props;
    const pget = axios.get(`/api/projects/byuser?uid=${user.id}`);
    const rget = axios.get("/api/reports/projects");

    Promise.all([pget, rget]).then(resp => {
      const projects = resp[0].data.filter(p => p.status !== "banned" && p.sharing !== "false" && Number(p.reports) < Constants.FLAG_COUNT_HIDE);
      const reports = resp[1].data;
      this.setState({loading: false, projects, reports});
    });
  }

  render() {
    const {t} = this.props;
    const {loading, projects, reports} = this.state;

    if (loading) return <h2>{ t("Loading projects") }...</h2>;

    return (
      <div className="user-section">
        <h2>{ t("Projects") }</h2>
        { projects.length
          ? <div className="flex-row">{ projects.map(p => {
              if (reports.find(r => r.report_id === p.id)) p.reported = true;
              return <ProjectCard project={ p } />;
            })}</div>
          : <p>{ t("This user doesn't have any projects yet.") }</p>}
      </div>
    );
  }
}

export default translate()(UserProjects);
