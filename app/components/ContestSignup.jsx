import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import "moment/locale/pt-br";
import moment from "moment";
import {CPF} from "cpf_cnpj";
import Loading from "components/Loading";
import {DateInput} from "@blueprintjs/datetime";
import {Icon, Toaster, Position, Intent} from "@blueprintjs/core";
import SelectGeo from "components/SelectGeo";
import SelectSchool from "components/SelectSchool";
import "./ContestSignup.css";

class ContestSignup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      profileUser: null,
      skip: false,
      gotEmailFromDB: false
    };
  }

  componentWillMount() {
    const {username} = this.props.user;

    axios.get(`/api/profile/${username}`).then(userResp => {
      const userData = userResp.data;
      if (userResp.error) {
        this.setState({mounted: true, error: userResp.error});
      }
      else {
        this.setState({
          mounted: true,
          profileUser: userData,
          gotEmailFromDB: Boolean(userData.email)
        });
      }
    });
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

  setBday(bday) {
    this.setState({profileUser: Object.assign(this.state.profileUser, {dob: moment(bday).format("YYYY-MM-DD")})});
  }

  setGid(geo) {
    this.setState({profileUser: Object.assign(this.state.profileUser, {gid: geo.id})});
  }

  setSid(school) {
    this.setState({profileUser: Object.assign(this.state.profileUser, {sid: school.id})});
  }

  handleCheckbox() {
    this.setState({skip: !this.state.skip});
  }

  isDobValid(bday) {
    const now = new Date();
    const then = new Date(bday);
    const diff = (now - then) / 1000 / 60 / 60 / 24 / 365;
    return diff < 19;
  }

  onEmailUpdate(e) {
    this.setState({profileUser: Object.assign(this.state.profileUser, {email: e.target.value})});
  }

  isEmailValid(email) {
    if (email) {
      const re = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");
      return re.test(email.toLowerCase());
    }
    else {
      return false;
    }
  }

  enterContest() {
    const {t} = this.props;
    const {profileUser, skip} = this.state;
    const profilePayload = {
      cpf: profileUser.cpf,
      dob: profileUser.dob
    };
    if (skip) {
      profilePayload.sid = -1;
    }
    else {
      profilePayload.gid = profileUser.gid;
      profilePayload.sid = profileUser.sid;
    }
    const userPayload = {
      email: profileUser.email
    };
    const contestPayload = {
      eligible: 1
    };
    const pPost = axios.post("/api/profile/", profilePayload);
    const uPost = axios.post("/api/user/email", userPayload);
    const cPost = axios.post("/api/contest", contestPayload);
    Promise.all([pPost, uPost, cPost]).then(resp => {
      if (resp.every(r => r.status === 200)) {
        const toast = Toaster.create({className: "signupToast", position: Position.TOP_CENTER});
        toast.show({message: t("Congratulations, you have signed up!"), intent: Intent.SUCCESS});
        if (this.props.onSignup) this.props.onSignup();
      }
    });
  }

  render() {

    if (!this.state.profileUser) return <Loading />;

    const {t} = this.props;
    const {cpf, dob, email, gid, sid} = this.state.profileUser;

    const good = <Icon iconName="tick" className="pt-intent-success" />;
    const bad = <Icon iconName="cross" className="pt-intent-danger" />;
    const popoverProps = {
      popoverClassName: "calendar-popover pt-minimal",
      inline: true
    };

    return (
      <div className="contest-signup-container">
        <form className="contest-signup-form">

          {/* form heading */}
          <h2 className="signup-heading font-xl u-text-center">{t("Contest.SignupFormHeading")}</h2>


          {/* location */}
          <div className={this.state.skip ? "field-container is-inactive" : "field-container"}>

            {/* your location */}
            <h3 className="font-sm u-margin-bottom-off">{t("YourLocation")}</h3>
            <SelectGeo gid={gid} callback={this.setGid.bind(this)} />

            {/* your school */}
            <h3 className="font-sm u-margin-bottom-off u-margin-top-md">{t("YourSchool")}</h3>
            <SelectSchool sid={sid} callback={this.setSid.bind(this)} />

          </div>

          {/* no thanks */}
          <div className="field-container pt-inline">
            <label className="pt-control pt-checkbox font-xs">
              <input type="checkbox" checked={this.state.skip} onChange={this.handleCheckbox.bind(this)}/>
              <span className="pt-control-indicator" />
              {t("I'd rather not say")}
            </label>
          </div>


          {/* required fields */}
          <h3 className="font-sm u-margin-bottom-off">{t("Contest.RequiredFields")}</h3>

          {/* email */}
          <div className={this.state.gotEmailFromDB ? "field-container is-immutable is-valid font-md has-icon" : "field-container font-md has-icon" }>
            <label className="font-sm" htmlFor="contest-signup-email">{ t("SignUp.Email") }</label>
            <input className="field-input"
              id="contest-signup-email"
              value={email || ""}
              type="email"
              name="contest-signup-email"
              onChange={this.onEmailUpdate.bind(this)}
              disabled={this.state.gotEmailFromDB}
              tabIndex={this.state.gotEmailFromDB ? "-1" : null } />
            <span className="field-icon pt-icon pt-icon-envelope" />
            <span className="field-icon position-right validation-icon pt-icon pt-icon-small-tick" />
          </div>

          {/* CPF */}
          <div className="field-container font-md has-icon">
            <label className="font-sm" htmlFor="cpf">{ t("CPF") }</label>
            <input className="field-input"
              id="cpf"
              value={cpf || ""}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000.000.000-00"
              name="cpf"
              onChange={this.onCpfUpdate.bind(this)} />
            <span className="field-icon pt-icon pt-icon-id-number" />
          </div>

          {/* Date of birth */}
          <div className="field-container date-picker-container font-md has-icon">
            <label className="font-sm" htmlFor="dob">{ t("DOB") }</label>
            <DateInput
              popoverProps={popoverProps}
              className="field-input font-sm"
              id="dob"
              onChange={this.setBday.bind(this)}
              value={dob ? moment(dob, "YYYY-MM-DD").format("MM/DD/YYYY") : null}
              format="DD/MM/YYYY"
              locale="pt-br"
              minDate={new Date("1900")}
              maxDate={new Date("2008")}
            />
            <span className="field-icon pt-icon pt-icon-calendar" />
          </div>

          <button
            type="button"
            className="pt-button pt-intent-success"
            onClick={this.enterContest.bind(this)}
            disabled={
              !this.isEmailValid(email) ||
              !CPF.isValid(cpf) ||
              !this.isDobValid(dob) ||
              !(this.state.skip || this.state.profileUser.gid && this.state.profileUser.sid)
            }
          >
            {t("Enter")}
          </button>

        </form>

        {/* <p>Hello <strong>{this.props.user.username}</strong>, please fill out the following profile fields to enter the contest</p>
        <p>Remember, you need to finish all Codelife Islands and submit a final project to be considered in the drawing!</p> */}

        <div id="eligibility-box">
          <ul>
            <li>{this.state.skip || this.state.profileUser.gid && this.state.profileUser.sid ? good : bad} location</li>
            <li>{this.isEmailValid(email) ? good : bad} email</li>
            <li>{CPF.isValid(cpf) ? good : bad} CPF</li>
            <li>{this.isDobValid(dob) ? good : bad} under 19</li>
          </ul>
        </div>


      </div>
    );
  }
}

ContestSignup = connect(state => ({
  user: state.auth.user
}))(ContestSignup);

export default translate()(ContestSignup);
