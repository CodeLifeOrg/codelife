import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
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
      projects: []
    };
  }

  /**
   * Grabs user id from user prop, makes AJAX call to server and returns
   * the list of projects.
   */
  componentDidMount() {
    const {user} = this.props;
    axios.get(`/api/projects/byuser?uid=${user.id}`).then(resp => {
      this.setState({loading: false, projects: resp.data});
    });
  }

  renderProjects(projects) {
    return projects.map(project =>
      <li className="project" key={project.id}>{project.name}</li>
    );
  }

  render() {
    const {t} = this.props;
    const {loading, projects} = this.state;

    if (loading) return <h2>{ t("Loading projects...") }</h2>;

    return (
      <div className="user-projects">
        <h2>{ t("Projects") }</h2>
        { projects.length
          ? this.renderProjects(projects)
          : <p>{ t("This user doesn't have any projects yet.") }</p>}
      </div>
    );
  }
}

export default translate()(UserProjects);
