import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import "moment/locale/pt-br";
import moment from "moment";
import {CPF} from "cpf_cnpj";
import LoadingSpinner from "components/LoadingSpinner";
import {DateInput} from "@blueprintjs/datetime";
import {Icon, Toaster, Position, Intent} from "@blueprintjs/core";
import SelectGeo from "components/SelectGeo";
import SelectSchool from "components/SelectSchool";
import "./ContestSignup.css";

/**
 * Signup page for (currently postponed) project contest. Signing up simply enters the user in the contest,
 * users still must go to the ContestSubmit page to select a project and finalize the procedure.
 */ 

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

  /**
   * On Mount, fetch the profile of the logged in user. 
   */
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

  /** 
   * Formatting rules for Cadastro de Pessoas Físicas
   */
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

  /**
   * Onclick handler that prepares entry payloads to various endpoints. Note that setting school id/ geo id in this
   * contest entry page also updates the actual profile of the user. 
   */
  enterContest(e) {
    e.preventDefault();

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

    if (!this.state.profileUser) return <LoadingSpinner />;

    const {t} = this.props;
    const {cpf, dob, email, gid, sid} = this.state.profileUser;
    const popoverProps = {
      popoverClassName: "calendar-popover pt-minimal",
      inline: true
    };

    // set email field classes based on state & validation
    let emailClasses = "field-container font-md has-icon";
    // valid email address entered, but not yet submitted
    this.isEmailValid(email) && !this.state.gotEmailFromDB
      ? emailClasses = "field-container font-md has-icon is-valid" : null;
    // valid email address has already been submitted
    this.state.gotEmailFromDB
      ? emailClasses = "field-container font-md has-icon is-valid is-immutable" : null;

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
    let dobClasses = "date-picker-container field-container font-md has-icon";
    // valid DOB entered
    this.isDobValid(dob)
      ? dobClasses = "date-picker-container field-container font-md has-icon is-valid" : null;
    // invalid DOB entered
    dob ? dob.length === 10 ? !this.isDobValid(dob)
      ? dobClasses = "date-picker-container field-container font-md has-icon is-invalid"
      : null : null : null;

    // validate all the things
    let readyToSubmit = false;

    !this.isEmailValid(email) ||
    !CPF.isValid(cpf) ||
    !this.isDobValid(dob) ||
    !(this.state.skip || this.state.profileUser.gid && this.state.profileUser.sid)
      ? readyToSubmit = true : false;

    // submit button classes based on validation
    let submitClasses = "field-container";
    // if anything isn't valid, add .is-disabled
    readyToSubmit
      ? submitClasses = "field-container is-disabled" : null;



    return (
      <div className="contest-signup-container">
        <form className="contest-signup-form" onSubmit={this.enterContest.bind(this)}>

          {/* form heading */}
          <h2 className="signup-heading font-xl u-text-center">{t("Contest.SignupFormHeading")}</h2>

          {/* location */}
          <div className="form-column form-column-half">

            {/* your location */}
            <h3 className="font-sm u-margin-bottom-off field-heading">{t("YourLocation")}</h3>
            <SelectGeo gid={gid} callback={this.setGid.bind(this)} />

            {/* skippable school section */}
            <div className={this.state.skip ? "field-container is-disabled" : "field-container"}>
              {/* your school */}
              <h3 className="font-sm u-margin-bottom-off field-heading">{t("YourSchool")}</h3>
              <SelectSchool sid={sid} callback={this.setSid.bind(this)} />
            </div>

            {/* no thanks */}
            <div className="field-container pt-inline">
              <div className="checkbox-container">
                <label className="pt-control pt-checkbox font-xs u-margin-bottom-off">
                  <input type="checkbox" checked={this.state.skip} onChange={this.handleCheckbox.bind(this)}/>
                  <span className="pt-control-indicator" />
                  {t("I'd rather not say")}
                </label>
              </div>
            </div>

          </div>


          {/* required fields */}
          <div className="form-column form-column-half">
            <h3 className="font-sm u-margin-bottom-off field-heading">{t("Contest.RequiredFields")}</h3>

            {/* email */}
            <div className={emailClasses}>
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
            <div className={cpfClasses}>
              <label className="font-sm" htmlFor="cpf">{ t("CPF") }</label>
              <input className="field-input"
                id="cpf"
                value={cpf || ""}
                type="text"
                placeholder="000.000.000-00"
                name="cpf"
                onChange={this.onCpfUpdate.bind(this)} />
              <span className="field-icon pt-icon pt-icon-id-number" />
              <span className="field-icon position-right validation-icon pt-icon pt-icon-small-tick" />
            </div>

            {/* Date of birth */}
            <div className={dobClasses}>
              <label className="font-sm" htmlFor="dob">{ t("DOB") }</label>
              <DateInput
                popoverProps={popoverProps}
                className="field-input font-sm"
                id="dob"
                onChange={this.setBday.bind(this)}
                value={dob ? moment(dob, "YYYY-MM-DD").format("MM/DD/YYYY") : null}
                format="DD/MM/YYYY"
                locale="pt-br"
                minDate={new Date("1999")}
                maxDate={new Date("2008")}
              />
              <span className="field-icon pt-icon pt-icon-calendar" />
              <span className="field-icon position-right validation-icon pt-icon pt-icon-small-tick" />
            </div>
          </div>

          {/* submit */}
          <div className={submitClasses}>
            <button
              type="submit"
              className="pt-button pt-fill pt-intent-primary font-md"
              disabled={ readyToSubmit }
              tabIndex={ readyToSubmit ? "-1" : null }>
              { t("Contest.SignUp") }
            </button>
          </div>

        </form>

        {/* <p>Hello <strong>{this.props.user.username}</strong>, please fill out the following profile fields to enter the contest</p>
        <p>Remember, you need to finish all Codelife Islands and submit a final project to be considered in the drawing!</p>

        <div id="eligibility-box">
          <ul>
            <li>{this.state.skip || this.state.profileUser.gid && this.state.profileUser.sid ? good : bad} location</li>
            <li>{this.isEmailValid(email) ? good : bad} email</li>
            <li>{CPF.isValid(cpf) ? good : bad} CPF</li>
            <li>{this.isDobValid(dob) ? good : bad} under 19</li>
          </ul>
        </div> */}

      </div>
    );
  }
}

ContestSignup = connect(state => ({
  user: state.auth.user
}))(ContestSignup);

export default translate()(ContestSignup);
