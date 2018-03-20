import React, {Component} from "react";
import {translate} from "react-i18next";
import LoginForm from "components/LoginForm";
import SignupForm from "components/SignupForm";
import {connect} from "react-redux";

class AuthForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: "login"
    };
  }

  componentDidMount() {
    const {initialMode} = this.props;
    if (initialMode) this.setState({mode: initialMode});
  }

  onSwitch() {
    const {mode} = this.state;
    mode === "login" ? this.setState({mode: "signup"}) : this.setState({mode: "login"});
  }

  render() {

    const {mode} = this.state;

    return (
      <div>
        {mode === "login" ? <LoginForm onSwitch={this.onSwitch.bind(this)}/> : <SignupForm onSwitch={this.onSwitch.bind(this)}/>}
      </div>
    );
  }
}

AuthForm = connect(state => ({
  auth: state.auth
}))(AuthForm);
AuthForm = translate()(AuthForm);
export default AuthForm;
