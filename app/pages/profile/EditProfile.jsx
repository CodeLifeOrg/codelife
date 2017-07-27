import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Intent, Position, Toaster} from "@blueprintjs/core";
import SelectGeo from "./SelectGeo";
import SelectSchool from "./SelectSchool";
import "@blueprintjs/datetime/dist/blueprint-datetime.css";
import "moment/locale/pt-br";
import moment from "moment";
import {DateInput} from "@blueprintjs/datetime";

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

    axios.get(`/api/profile/${username}`).then(userResp => {
      const userData = userResp.data;
      if (userResp.error) {
        this.setState({loading: false, error: userResp.error});
      }
      else {
        this.setState({
          loading: false,
          profileUser: userData
        });
      }
    });
  }

  onSimpleUpdate(e) {
    const {profileUser} = this.state;
    profileUser[e.target.id] = e.target.value;
    this.setState({profileUser});
  }

  saveUserInfo(e) {
    e.preventDefault();
    this.setState({loading: true});
    const {profileUser} = this.state;
    const userPostData = {
      bio: profileUser.bio,
      dob: profileUser.dob,
      gender: profileUser.gender,
      gid: profileUser.gid,
      name: profileUser.name,
      sid: profileUser.sid
    };
    console.log("userPostData:\n", userPostData);
    axios.post("/api/profile/", userPostData).then(resp => {
      const responseData = resp.data;
      if (responseData.error) {
        this.setState({loading: false, error: responseData.error});
      }
      else {
        const t = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
        t.show({message: "Profile saved!", intent: Intent.SUCCESS});
        this.setState({loading: false, msg: responseData});
      }
    });
  }

  setGid(geo) {
    this.setState({profileUser: Object.assign(this.state.profileUser, {gid: geo.id})});
  }

  setSid(school) {
    this.setState({profileUser: Object.assign(this.state.profileUser, {sid: school.id})});
  }

  setBday(bday) {
    this.setState({profileUser: Object.assign(this.state.profileUser, {dob: moment(bday).format("YYYY-MM-DD")})});
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
    const {t} = this.props;
    const {loading, error, profileUser} = this.state;
    const onSimpleUpdate = this.onSimpleUpdate.bind(this);
    const saveUserInfo = this.saveUserInfo.bind(this);
    const setGid = this.setGid.bind(this);
    const setSid = this.setSid.bind(this);
    const setBday = this.setBday.bind(this);

    if (loading) return <h1>Loading ...</h1>;
    if (error) return <h1>{error}</h1>;

    const {name, bio, dob, gender, gid, sid} = profileUser;

    moment.locale("pt-BR");
    // console.log(moment.locale()); // pt-BR

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
                <textarea onChange={onSimpleUpdate} value={bio || ""} id="bio" className="pt-input" dir="auto"></textarea>
              </div>
            </div>
          </div>

          <div className="pt-form-group pt-inline">
            <label className="pt-label" htmlFor="example-form-group-input-d">
              {t("Gender")}
            </label>
            <div className="pt-form-content">
              <div className="pt-select">
                <select onChange={onSimpleUpdate} id="gender" value={gender}>
                  <option value="OTHER">{t("Rather not say")}</option>
                  <option value="FEMALE">{t("Female")}</option>
                  <option value="MALE">{t("Male")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-form-group pt-inline">
            <label className="pt-label" htmlFor="example-form-group-input-d">
              {t("Where are you from?")}
            </label>
            <SelectGeo gid={gid} callback={setGid} />
          </div>

          <div className="pt-form-group pt-inline">
            <label className="pt-label" htmlFor="example-form-group-input-d">
              {t("What school do you go to?")}
            </label>
            <SelectSchool sid={sid} callback={setSid} />
          </div>

          <div className="pt-form-group pt-inline">
            <label className="pt-label" htmlFor="example-form-group-input-d">
              {t("Birthday")}
            </label>
            <div className="pt-form-content">
              <DateInput
                onChange={setBday}
                value={dob ? moment(dob, "YYYY-MM-DD").format("MM/DD/YYYY") : null}
                format="DD/MM/YYYY"
                locale="pt-br"
                minDate={new Date("1900")}
                maxDate={new Date()}
              />
            </div>
          </div>

          <button onClick={saveUserInfo} type="button" className="pt-button">Save</button>

        </form>
      </div>
    );
  }
}

Profile = connect(state => ({
  user: state.auth.user
}))(Profile);

export default translate()(Profile);
