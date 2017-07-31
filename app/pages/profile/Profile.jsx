import axios from "axios";
import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {connect} from "react-redux";

import Loading from "components/Loading";

import UserInfo from "./UserInfo";
import UserSnippets from "./UserSnippets";
import UserProjects from "./UserProjects";
import "./Profile.css";

/**
 * Class component for a user profile.
 * This is a public page and meant to be shared.
 * If a user is logged in AND this is their profile, show an
 * edit button allowing them to edit it.
 */
class Profile extends Component {

  /**
   * Creates the Profile component with its initial state.
   * @param {boolean} loading - true by defaults gets flipped post AJAX.
   * @param {string} error - Gets set if no username matches username URL param.
   * @param {object} profileUser - Gets set to full user object from DB.
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: null,
      profileUser: null
    };
  }

  /**
   * Grabs username from URL param, makes AJAX call to server and sets error
   * state (if no user is found) or profileUser (if one is).
   */
  componentWillMount() {
    const {username} = this.props.params;

    axios.get(`/api/profile/${username}`).then(resp => {
      const responseData = resp.data;
      if (responseData.error) {
        this.setState({loading: false, error: responseData.error});
      }
      else {
        this.setState({loading: false, profileUser: responseData});
      }
    });
  }

  /**
   * 3 render states:
   * case (loading)
   *  - show loading
   * case (error)
   *  - show error msg from server
   * case (user found)
   *  - user info
   */
  render() {
    const {t, user: loggedInUser} = this.props;
    const {loading, error, profileUser} = this.state;
    console.log(loggedInUser, profileUser);

    if (loading) return <Loading />;

    if (error) return <h1>{error}</h1>;

    return (
      <div>
        <aside className="side-bar">
          <UserInfo user={profileUser} />
          {/* <skillsList /> */}
        </aside>
        <content>
          <h2>About Me</h2>
          { loggedInUser.id === profileUser.id
            ? <Link className="link" to={`/profile/${profileUser.username}/edit`}>{ t("Edit Resume") }</Link>
            : null }
          { profileUser.bio
            ? <p className="bio">{ profileUser.bio }</p>
            : null }
          <UserSnippets user={profileUser} />
          <UserProjects user={profileUser} />
        </content>
      </div>
    );
  }
}

Profile = connect(state => ({
  user: state.auth.user
}))(Profile);

export default translate()(Profile);
