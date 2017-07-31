import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import "./Profile.css";

class UserInfo extends Component {

  render() {
    const {t, loggedInUser, user} = this.props;

    return (
      <div className="user-info">
        <span className="pt-icon-large pt-icon-user pt-intent-primary"></span>
        <h1>{ user.name || user.username }</h1>
        { loggedInUser.id === user.id
          ? <Link className="pt-button edit-link" to={`/profile/${user.username}/edit`}>{ t("Edit Profile") }</Link>
          : null }
        { user.gid
          ? <p className="geo-name"><span className="pt-icon-standard pt-icon-map-marker"></span>{ user.geoname ? `${user.geoname}, ` : null }{ user.gid.substr(1, 2).toUpperCase() }</p>
          : null }
        { user.schoolname
          ? <p className="school-name"><span className="pt-icon-standard pt-icon-book"></span>{ user.schoolname }</p>
          : null }
        { user.email
          ? <p className="email"><span className="pt-icon-standard pt-icon-envelope"></span>{ user.email }</p>
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
