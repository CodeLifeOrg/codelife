import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";

// Profile Page
// Currently a placeholder for what will be a dashboard of completed tracks/courses.

class Profile extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>{t("Profile")}</h1>
        <p>I'm a user</p>
        <Nav />
      </div>
    );
  }
}

export default translate()(Profile);
