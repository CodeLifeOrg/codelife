import axios from "axios";
import React, {Component} from "react";
import {browserHistory} from "react-router";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Intent, Position, Toaster} from "@blueprintjs/core";
import Loading from "components/Loading";
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
      img: null
    };
  }

  componentWillMount() {
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
          profileUser: userData
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
    //console.log("userPostData:\n", userPostData);
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
    const {error, loading, profileUser} = this.state;
    const onSimpleUpdate = this.onSimpleUpdate.bind(this);
    const onCpfUpdate = this.onCpfUpdate.bind(this);
    const saveUserInfo = this.saveUserInfo.bind(this);
    const onImgUpdate = this.onImgUpdate.bind(this);
    const setGid = this.setGid.bind(this);
    const setSid = this.setSid.bind(this);
    const setBday = this.setBday.bind(this);

    if (loading) return <Loading />;
    if (error) return <h1>{error}</h1>;

    const {name, bio, cpf, dob, gender, gid, sid} = profileUser;

    moment.locale("pt-BR");
    // console.log(moment.locale()); // pt-BR

    return (
      <div id="profile">

        <aside className="profile-side">
          <UserInfo user={profileUser} loggedInUser={loggedInUser} mode="edit" />
          {/* <skillsList /> */}
        </aside>

        {/* edit profile */}
        <div className="profile-info">
          <h2>{t("Edit Profile")}</h2>
          <form className="profile-edit-form">


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

            {/* about me */}
            <div className="field-container font-md">
              <label className="font-sm" htmlFor="profile-about">{ t("About me") }</label>
              <textarea className="field-input"
                id="profile-about"
                name="bio"
                value={bio || ""}
                onChange={onSimpleUpdate} />
            </div>

            {/* select gender */}
            <div className="field-container gender-select-container font-md">
              <label className="font-sm" htmlFor="gender-select">{ t("Gender") }</label>
              <div className="pt-select">
                <select className="field-input"
                  id="gender-select"
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

            <div className="field-container location-group-inner">

              <h3 className="font-sm u-margin-bottom-off u-margin-top-md">{t("My location")}</h3>
              <SelectGeo gid={gid} callback={setGid} />

              <h3 className="font-sm u-margin-bottom-off u-margin-top-md">{t("My school")}</h3>
              <SelectSchool sid={sid} callback={setSid} />

            </div>

            <div className="pt-form-group pt-inline">
              <label className="pt-label" htmlFor="example-form-group-input-d">
                {t("CPF")}
              </label>
              <div className="pt-form-content">
                <div className="pt-input-group">
                  <input onChange={onCpfUpdate} value={cpf || ""} placeholder="000.000.000-00" id="cpf" className="pt-input" type="text" dir="auto" />
                </div>
              </div>
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

            <button onClick={saveUserInfo} type="button" className="pt-button pt-intent-success">{t("Save")}</button>

          </form>
        </div>
      </div>
    );
  }
}

EditProfile = connect(state => ({
  user: state.auth.user
}))(EditProfile);

export default translate()(EditProfile);
