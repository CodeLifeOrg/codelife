import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import "./Profile.css";

class UserInfo extends Component {

  render() {
    const {t} = this.props;
    const {user} = this.props;

    return (
      <div className="user-info">
        <span className="pt-icon-large pt-icon-user"></span>
        <h1>{ user.name }</h1>
        { user.schoolname
          ? <p className="school-name">{ user.schoolname }</p>
          : null }
        { user.gid
          ? <p className="geo-name">{ user.geoname }, { user.gid.substr(1, 2).toUpperCase() }</p>
          : null }
        { user.email
          ? <p className="email"><span className="pt-icon-standard pt-icon-envelope"></span> { user.email }</p>
          : null }
        <p className="url">
          <span className="pt-icon-standard pt-icon-link"></span>
          <a href={`/profile/${user.username}/`}>{`http://codelife.com/profile/${user.username}/`}</a>
        </p>
      </div>
    );
  }
}

export default translate()(UserInfo);
