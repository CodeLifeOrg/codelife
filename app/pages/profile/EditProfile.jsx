import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";

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
    const {username: loggedInUsername} = this.props.user;

    if (username !== loggedInUsername) {
      this.setState({
        loading: false,
        error: "You don't have permission to edit this user's profile."
      });
      return;
    }

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

  onSimpleUpdate(e) {
    const {profileUser} = this.state;
    profileUser[e.target.id] = e.target.value;
    this.setState({profileUser});
  }

  /**
   * 3 render states:
   * case (loading)
   *  - show loading
   * case (error)
   *  - show error msg from server
   * case (user found)
   *  - user info
   * TODO:
   *  - create 4th state in which user is logged in and this is their profile
   *  - allowing them to edit it.
   */
  render() {
    const {t} = this.props;
    const {loading, error, profileUser} = this.state;
    const onSimpleUpdate = this.onSimpleUpdate.bind(this);

    if (loading) return <h1>Loading ...</h1>;
    if (error) return <h1>{error}</h1>;

    const {name} = profileUser;

    return (
      <div>
        <h1>{t("Edit Profile")}</h1>
        <form>

          <div className="pt-form-group pt-inline">
            <label className="pt-label" htmlFor="example-form-group-input-d">
              {t("Name")}
            </label>
            <div className="pt-form-content">
              <div className="pt-input-group">
                <input onChange={onSimpleUpdate} value={name} id="name" className="pt-input" style={{width: "200px"}} type="text" dir="auto" />
              </div>
            </div>
          </div>

          <div className="pt-form-group pt-inline">
            <label className="pt-label" htmlFor="example-form-group-input-d">
              {t("About Me")}
            </label>
            <div className="pt-form-content">
              <div className="pt-input-group">
                <textarea onChange={onSimpleUpdate} value={name} id="bio" className="pt-input" dir="auto"></textarea>
              </div>
            </div>
          </div>

          <div className="pt-form-group pt-inline">
            <label className="pt-label" htmlFor="example-form-group-input-d">
              {t("Where are you from?")}
            </label>
            <div className="pt-form-content">
              <div className="pt-select">
                <select>
                  <option selected>Choose an item...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                  <option value="4">Four</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-form-group pt-inline">
            <label className="pt-label" htmlFor="example-form-group-input-d">
              {t("School")}
            </label>
            <div className="pt-form-content">
              <div className="pt-select">
                <select>
                  <option selected>Choose an item...</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                  <option value="4">Four</option>
                </select>
              </div>
            </div>
          </div>

        </form>
      </div>
    );
  }
}

Profile = connect(state => ({
  user: state.auth.user
}))(Profile);

export default translate()(Profile);
