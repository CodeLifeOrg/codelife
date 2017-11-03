import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Login, SignUp} from "datawheel-canon";
import axios from "axios";
import "./Home.css";

class Home extends Component {

  constructor() {
    super();
    this.state = {
      codeBlocks: false,
      current: false,
      projects: false,
      signup: true
    };
  }

  toggleSignup() {
    this.setState({signup: !this.state.signup});
  }

  componentDidMount() {
    const {user} = this.props;
    if (user) {
      axios.get("/api/userprogress").then(resp => this.setState({current: resp.data.current}));
    }
    const codeBlocks = axios.get("/api/codeBlocks/featured");
    const projects = axios.get("/api/projects/featured");
    Promise.all([codeBlocks, projects])
      .then(resp => {
        console.log(resp);
      });
  }

  render() {

    const {t, user} = this.props;
    const {current, signup} = this.state;

    console.log(current);

    return (
      <div id="Home">
        <div className="video-container">
          <div className="video">
            <div className="play">
              <span className="pt-icon-large pt-icon-play"></span>
              <div className="title">Welcome to CodeLife</div>
            </div>
          </div>
          <div className="tagline">{ t("home.tagline") }</div>
        </div>
        { !user
          ? <div className="enter-container">
            <div className="avatar">
              <img src="/avatars/test-group.png" />
              <div className="prompt">{ t("home.prompt") }</div>
            </div>
            { signup
              ? <div className="form">
                <a className="callToAction" onClick={ this.toggleSignup.bind(this) }>{ t("Login.CallToAction") }</a>
                <SignUp />
              </div>
              : <div className="form">
                <Login />
                <a className="callToAction" onClick={ this.toggleSignup.bind(this) }>{ t("SignUp.CallToAction") }</a>
              </div>
            }
          </div>
          : null }
      </div>
    );
  }
}

Home = connect(state => ({user: state.auth.user}))(Home);
export default translate()(Home);
