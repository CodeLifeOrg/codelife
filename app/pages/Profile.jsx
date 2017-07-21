import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";

class Profile extends Component {

  render() {
    
    const {t, user} = this.props;

    if (!user) return <h1>Loading ...</h1>;

    return (
      <div>
        <h1>{t("Profile")}</h1>
        <p>I'm a user and my name is {user.username} </p>
      </div>
    );
  }
}

Profile = connect(state => ({
  user: state.auth.user
}))(Profile);
Profile = translate()(Profile);
export default Profile;
