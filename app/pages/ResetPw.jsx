import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import axios from "axios";
import {Reset as CanonReset} from "datawheel-canon";
import "./ResetPw.css";

class ResetPw extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    const {token} = this.props.location.query;
    console.log(this.props.checkResetToken)
    // if (token) {
    //   // this.props.checkResetToken(token);
    //   axios.get(`/api/auth/isResetValid?token=${token}`)
    //     .then(response => {
    //       console.log(response.data);
    //       // dispatch(response.data.success ? resetTokenIsValid() : resetTokenIsNotValid());
    //     });
    // }
  }

  render() {
    const {location, t} = this.props;

    return (
      <div id="ResetPw">
        <h1>{ t("Reset Password") }</h1>
        <div>
          <CanonReset location={ location } />
        </div>
      </div>
    );
  }
}

ResetPw = connect(state => ({
  locale: state.i18n.locale
}))(ResetPw);
export default translate()(ResetPw);
