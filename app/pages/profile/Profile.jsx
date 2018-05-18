import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Link} from "react-router";
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
        const sharing = responseData.sharing === "true" ? true : false;
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
    const {error, loading, profileUser, sharing} = this.state;

    // check if the user is viewing their own profile
    let myProfile = false;
    loggedInUser.id || profileUser.id && // check for id first (prevents error screen)
      loggedInUser.id === profileUser.id ? myProfile = true : null;

    // check for admin status
    let adminUser = false;
    this.props.user.role > 1 ? adminUser = true : null;

    if (loading) return <Loading />;

    if (error) return <div className="content u-vertical-align-children u-text-center"><h1>{error}</h1></div>;

    return (
      <div className="content view-profile u-padding-top-off">

        {/* header */}
        <header className="header">
          <div className={ profileUser.img ? "header-inner has-img" : "header-inner text-only" }>

            {/* avatar */}
            { profileUser.img &&
              <div className="header-avatar">
                <img className="header-avatar-img" src={ `/uploads/${ profileUser.img }?v=${ new Date().getTime() }` } alt="" />
              </div>
            }

            {/* name & info */}
            <div className="header-text">

              {/* name / username */}
              <h1 className="user-name font-xl u-margin-top-off u-margin-bottom-sm">
                { profileUser.name || profileUser.username }
                { !sharing && <span className="font-md"> ({ t("hidden") })</span> }
              </h1>
              {/* bio */}
              { profileUser.bio &&
                <p className="bio font-lg u-margin-top-xs">{ profileUser.bio }</p>
              }


              {/* meta info */}
              <div className="profile-meta-list">

                {/* location */}
                { profileUser.gid &&
                  <p className="location-profile-meta profile-meta">
                    <span className="u-visually-hidden">{ t("City") }: </span>
                    <span className="profile-meta-icon pt-icon-standard pt-icon-map-marker" />
                    <span className="profile-meta-text">
                      { profileUser.geoname && `${profileUser.geoname}, ${ profileUser.gid.substr(1, 2).toUpperCase() }` }
                    </span>
                  </p>
                }
                {/* school */}
                { profileUser.schoolname &&
                  <p className="school-profile-meta profile-meta">
                    <span className="u-visually-hidden">{ t("School") }: </span>
                    <span className="profile-meta-icon pt-icon-standard pt-icon-book" />
                    <span className="profile-meta-text">
                      { profileUser.schoolname }
                    </span>
                  </p>
                }
              </div>

              {/* meta links */}
              <div className="profile-meta-list">
                {/* email address */}
                { profileUser.email &&
                  <p className="email-profile-meta profile-meta">
                    <a className="profile-meta-link" href={`mailto:${ profileUser.email }`}>
                      <span className="u-visually-hidden">{ t("LogIn.Email") }: </span>
                      <span className="profile-meta-icon pt-icon-standard pt-icon-envelope" />
                      <span className="profile-meta-text">
                        { profileUser.email }
                      </span>
                    </a>
                  </p>
                }
                {/* direct profile link */}
                <p className="url-profile-meta profile-meta">
                  <Link className="profile-meta-link" to={`/profile/${profileUser.username}/`}>
                    <span className="u-visually-hidden">{ t("ShareDirectLink.Label") }: </span>
                    <span className="profile-meta-icon pt-icon-standard pt-icon-link" />
                    <span className="profile-meta-text">
                      { `codelife.com/profile/${profileUser.username}` }
                    </span>
                  </Link>
                </p>
              </div>

              {/* profile controls */}
              { myProfile || adminUser ?
                <div className="profile-control-list u-margin-top-md font-sm">
                  {/* edit button */}
                  { myProfile &&
                    <Link className="profile-control pt-button pt-intent-primary edit-link" to={`/profile/${profileUser.username}/edit`}>
                      <span className="pt-icon pt-icon-cog" />
                      { t("Edit Profile") }
                    </Link>
                  }
                  {/* profile visibility toggle */}
                  { adminUser &&
                    <Switch
                      className="profile-control"
                      checked={this.state.sharing}
                      label={ t("Profile.Visible") }
                      onChange={this.handleChangeSharing.bind(this)}
                    />
                  }
                  </div>
                : null }
            </div>
          </div>
        </header>

        { sharing ?
          <content className="profile-info">
            <UserCodeBlocks user={profileUser} />
            <UserProjects user={profileUser} />
            {/* {profileUser.gid ? <UsersList type="geo" user={profileUser} /> : null}
            {profileUser.sid && profileUser.sid !== -1 ? <UsersList type="school" user={profileUser} /> : null} */}
          </content>
          : <h2 className="u-text-center">{ t("Profile.HiddenContent") }</h2>
        }
      </div>
    );
  }
}

Profile = connect(state => ({
  user: state.auth.user
}))(Profile);

export default translate()(Profile);
