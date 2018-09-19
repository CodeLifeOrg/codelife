import axios from "axios";
import React, {Component} from "react";
import PropTypes from "prop-types";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Intent, Position, Toaster, Checkbox} from "@blueprintjs/core";
import LoadingSpinner from "components/LoadingSpinner";
import UserInfo from "./UserInfo";
import SelectGeo from "components/SelectGeo";
import SelectSchool from "components/SelectSchool";
import SelectImg from "./SelectImg";
import "@blueprintjs/datetime/dist/blueprint-datetime.css";
import "moment/locale/pt-br";
import moment from "moment";
import {DateInput} from "@blueprintjs/datetime";
import {CPF} from "cpf_cnpj";

class EditProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: null,
      profileUser: null,
      optOut: false,
      optOutLocation: false,
      img: null
    };
  }

  componentDidMount() {
    const {params, t} = this.props;
    const {username} = params;
    const {username: loggedInUsername} = this.props.user;

    if (username !== loggedInUsername) {
      this.setState({
        loading: false,
        error: t("userPermissionError")
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
          profileUser: userData,
          optOut: userData.sid === -1,
          optOutLocation: userData.gid === "-1"
        });
      }
    });
  }

  onSimpleUpdate(e) {
    const {profileUser} = this.state;
    // use `name` attribute for value so IDs can remain unique
    profileUser[e.target.name] = e.target.value;
    this.setState({profileUser});
  }

  saveUserInfo(e) {
    const {browserHistory} = this.context;
    e.preventDefault();
    this.setState({loading: true});
    const {t} = this.props;
    const {profileUser, img} = this.state;
    const userPostData = {
      bio: profileUser.bio,
      cpf: profileUser.cpf,
      dob: profileUser.dob,
      gender: profileUser.gender,
      gid: profileUser.gid,
      name: profileUser.name,
      sid: profileUser.sid
    };
    if (this.state.optOut) userPostData.sid = -1;
    if (this.state.optOutLocation) userPostData.gid = "-1";
    axios.post("/api/profile/", userPostData).then(resp => {
      const responseData = resp.data;
      if (responseData.error) {
        this.setState({loading: false, error: responseData.error});
      }
      else {
        if (img) {
          const config = {headers: {"Content-Type": "multipart/form-data"}};
          const formData = new FormData();
          formData.append("file", img);
          axios.post("/api/profileImgUpload/", formData, config).then(imgResp => {
            const imgRespData = imgResp.data;
            if (imgRespData.error) {
              const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
              toast.show({message: t("Unable to upload image!"), intent: Intent.DANGER});
              browserHistory.push(`/profile/${profileUser.username}`);
            }
            else {
              const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
              toast.show({message: t("Profile saved!"), intent: Intent.SUCCESS});
              browserHistory.push(`/profile/${profileUser.username}`);
            }
          }).catch(error => {
            // Do something with response error
            if (error.response.status === 413) {
              const toast = Toaster.create({className: "company-saved-toast", position: Position.TOP_CENTER});
              toast.show({message: t("Unable to upload image!"), intent: Intent.DANGER});
            }
            browserHistory.push(`/profile/${profileUser.username}`);
            return Promise.reject(error.response);
          });
        }
        else {
          const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
          toast.show({message: t("Profile saved!"), intent: Intent.SUCCESS});
          browserHistory.push(`/profile/${profileUser.username}`);
        }
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

  formatCPF(input) {
    // Strip all characters from the input except digits
    input = input.replace(/\D/g, "");

    // Trim the remaining input to eleven characters, to preserve cpf format
    input = input.substring(0, 11);

    // Based upon the length of the string, we add formatting as necessary
    const size = input.length;
    if (size < 4) {
      input = input;
    }
    else if (size < 7) {
      input = `${input.substring(0, 3)}.${input.substring(3)}`;
    }
    else if (size < 10) {
      input = `${input.substring(0, 3)}.${input.substring(3, 6)}.${input.substring(6)}`;
    }
    else {
      input = `${input.substring(0, 3)}.${input.substring(3, 6)}.${input.substring(6, 9)}-${input.substring(9)}`;
    }
    return input;
  }

  onCpfUpdate(e) {
    const cpf = this.formatCPF(e.target.value);
    const cpfValid = CPF.isValid(cpf);
    this.setState({profileUser: Object.assign(this.state.profileUser, {cpf})});
  }

  onImgUpdate(file) {
    this.setState({img: file});
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
    const {error, loading, profileUser, optOut, optOutLocation} = this.state;
    const onSimpleUpdate = this.onSimpleUpdate.bind(this);
    const onCpfUpdate = this.onCpfUpdate.bind(this);
    const saveUserInfo = this.saveUserInfo.bind(this);
    const onImgUpdate = this.onImgUpdate.bind(this);
    const setGid = this.setGid.bind(this);
    const setSid = this.setSid.bind(this);
    const setBday = this.setBday.bind(this);
    const popoverProps = {
      popoverClassName: "calendar-popover pt-minimal",
      inline: true
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <h1>{error}</h1>;

    const {name, bio, cpf, dob, gender, gid, sid} = profileUser;

    moment.locale("pt-BR");
    // console.log(moment.locale()); // pt-BR

    // set CPF field classes based on validation
    let cpfClasses = "field-container font-md has-icon";
    // valid CPF entered
    CPF.isValid(cpf)
      ? cpfClasses = "field-container font-md has-icon is-valid" : null;
    // invalid CPF entered
    cpf ? cpf.length === 14 ? !CPF.isValid(cpf)
      ? cpfClasses = "field-container font-md has-icon is-invalid"
      : null : null : null;

    // set DOB field classes based on validation
    const dobClasses = "date-picker-container field-container font-md has-icon";

    return (
      <div className="edit-profile" id="profile">

        {/* the form */}
        <form className="profile-edit-form form-container" onSubmit={saveUserInfo}>

          {/* form heading */}
          <h1 className="profile-heading">{t("Editing profile…")}</h1>

          {/* my info */}
          <h2 className="font-sm u-margin-bottom-off u-margin-top-md">{t("My info")}</h2>

          {/* name, image, gender, dob */}
          <div className="form-column form-column-half u-margin-top-off">

            {/* name */}
            <div className="field-container font-md has-icon">
              <label className="font-sm" htmlFor="profile-name">{ t("Display name") }</label>
              <input className="field-input"
                id="profile-name"
                value={name}
                type="text"
                name="name"
                onChange={onSimpleUpdate}
                autoFocus />
              <span className="field-icon pt-icon pt-icon-id-number" />
            </div>

            {/* file select */}
            <SelectImg callback={onImgUpdate} context="profile" />

            {/* select gender */}
            <div className="field-container gender-select-container font-md">
              <label className="font-sm" htmlFor="gender-select">{ t("Gender") }</label>
              <div className="pt-select">
                <select className="field-input"
                  id="profile-gender-select"
                  name="gender"
                  value={gender || ""}
                  onChange={onSimpleUpdate}>
                  <option value="OTHER">{t("Rather not say")}</option>
                  <option value="FEMALE">{t("Female")}</option>
                  <option value="MALE">{t("Male")}</option>
                </select>
              </div>
              {/* <span className="field-icon pt-icon pt-icon-application" /> */}
            </div>

            {/* Date of birth */}
            <div className={dobClasses}>
              <label className="font-sm" htmlFor="profile-dob">{ t("DOB") }</label>
              <DateInput
                popoverProps={popoverProps}
                className="field-input font-sm"
                id="profile-dob"
                name="dob"
                onChange={setBday}
                value={dob ? moment(dob, "YYYY-MM-DD").format("MM/DD/YYYY") : null}
                format="DD/MM/YYYY"
                locale="pt-br"
                minDate={new Date("1918")}
                maxDate={new Date()}
              />
              <span className="field-icon pt-icon pt-icon-calendar" />
              <span className="field-icon position-right validation-icon pt-icon pt-icon-small-tick" />
            </div>
          </div>

          {/* about me, CPF */}
          <div className="form-column form-column-half u-margin-top-off">
            {/* about me */}
            <div className="field-container font-md">
              <label className="font-sm" htmlFor="profile-about">{ t("About me") }</label>
              <textarea className="field-input"
                id="profile-about"
                name="bio"
                value={bio || ""}
                onChange={onSimpleUpdate} />
            </div>
            {/* CPF */}
            <div className={cpfClasses}>
              <label className="font-sm" htmlFor="profile-cpf">{ t("CPF") }</label>
              <input className="field-input"
                id="profile-cpf"
                name="cpf"
                value={cpf || ""}
                type="text"
                placeholder="000.000.000-00"
                onChange={onCpfUpdate} />
              <span className="field-icon pt-icon pt-icon-id-number" />
              <span className="field-icon position-right validation-icon pt-icon pt-icon-small-tick" />
            </div>
          </div>

          {/* location & school */}
          <div className="field-container location-group-inner">
            {/* location */}
            <h2 className="font-sm u-margin-top-md">{t("My location")}</h2>
            <Checkbox
              checked={this.state.optOutLocation}
              label={t("I'd rather not say")}
              onChange={e => this.setState({optOutLocation: Boolean(e.target.checked)})}
            />
            { !optOutLocation && <SelectGeo gid={gid} callback={setGid} /> }
            {/* school */}
            <h2 className="font-sm u-margin-top-md">{t("My school")}</h2>
            <Checkbox
              checked={this.state.optOut}
              label={t("I'd rather not say")}
              onChange={e => this.setState({optOut: Boolean(e.target.checked)})}
            />
            { !optOut && <SelectSchool sid={sid} callback={setSid} /> }
          </div>

          {/* submit */}
          <div className="field-container">
            <button type="submit" className="pt-button pt-fill pt-intent-primary font-md">
              { t("Save changes") }
            </button>
          </div>
        </form>

        {/* <aside className="profile-side">
          <UserInfo user={profileUser} loggedInUser={loggedInUser} mode="edit" />
          <skillsList />
        </aside> */}
      </div>
    );
  }
}

EditProfile.contextTypes = {
  browserHistory: PropTypes.object
};

EditProfile = connect(state => ({
  user: state.auth.user
}))(EditProfile);

export default translate()(EditProfile);
