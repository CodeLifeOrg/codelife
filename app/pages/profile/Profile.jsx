import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Switch} from "@blueprintjs/core";
import Loading from "components/Loading";

import UserInfo from "./UserInfo";
import UserCodeBlocks from "./UserCodeBlocks";
import UserProjects from "./UserProjects";
import UsersList from "./UsersList";
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
      profileUser: null,
      sharing: true
    };
  }

  /**
   * Grabs username from URL param, makes AJAX call to server and sets error
   * state (if no user is found) or profileUser (if one is).
   */
  componentWillMount() {
    const {username} = this.props.params;
    this.fetchUser(username);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.username !== this.props.params.username) {
      console.log("changed url!");
      this.setState({loading: true});
      this.fetchUser(nextProps.params.username);
    }
  }

  fetchUser(username) {
    axios.get(`/api/profile/${username}`).then(resp => {
      const responseData = resp.data;
      if (responseData.error) {
        this.setState({loading: false, error: responseData.error});
      }
      else {
        const sharing = responseData.sharing;
        this.setState({loading: false, profileUser: responseData, sharing});
      }
    });
  }

  handleChangeSharing(e) {
    const {sharing, profileUser} = this.state;

    const newSharing = e.target.checked ? "true" : "false";
    const uid = profileUser.uid;
    axios.post("/api/profile/setsharing", {sharing: newSharing, uid}).then(resp => {
      if (resp.status === 200) {
        console.log("updated");
        this.setState({sharing: !sharing});
      }
      else {
        console.log("error");
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

    if (loading) return <Loading />;

    if (error) return <h1>{error}</h1>;

    return (
      <div id="profile">
        <aside className="profile-side">
          
          <UserInfo user={profileUser} loggedInUser={loggedInUser} />
          { this.props.user.role > 1 ? <Switch checked={this.state.sharing} label="Sharing Enabled" onChange={this.handleChangeSharing.bind(this)} /> : null }
          {/* <skillsList /> */}
        </aside>
        <content className="profile-info">
          { profileUser.bio
            ? <div className="user-section">
                <h2>{t("About Me")}</h2>
                <p className="bio">{ profileUser.bio }</p>
              </div>
            : null }
          <UserCodeBlocks user={profileUser} />
          <UserProjects user={profileUser} />
          {profileUser.gid ? <UsersList type="geo" user={profileUser} /> : null}
          {profileUser.sid ? <UsersList type="school" user={profileUser} /> : null}
        </content>
      </div>
    );
  }
}

Profile = connect(state => ({
  user: state.auth.user
}))(Profile);

export default translate()(Profile);
