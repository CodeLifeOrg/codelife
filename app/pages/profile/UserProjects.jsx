import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
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

    Promise.all([pget]).then(resp => {
      const projects = resp[0].data;
      this.setState({loading: false, projects});
    });
  }

  render() {
    const {t} = this.props;
    const {loading, projects} = this.state;

    if (loading) return <h2>{ t("Loading projects") }...</h2>;

    return (
      <div className="user-section">
        <h2>{ t("Projects") }</h2>
        { projects.length
          ? <div className="card-list">{ projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>
          : <p>{ t("noProjects") }</p>
        }
      </div>
    );
  }
}

export default translate()(UserProjects);
