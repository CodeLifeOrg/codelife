import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import "./Profile.css";

class UserInfo extends Component {

  render() {
    const {t, loggedInUser, user, mode} = this.props;

    return (
      <div className="user-info">

        {user.img
          ? <div className="user-img" style={{backgroundImage: `url(/uploads/${user.img}?v=${new Date().getTime()})`}}></div>
          : <span className="pt-icon-large pt-icon-user pt-intent-primary"></span>}
        <h1 className="user-name">{ user.name || user.username }</h1>
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
        { loggedInUser.id === user.id && mode === "view"
          ? <Link className="pt-button edit-link" to={`/profile/${user.username}/edit`}>{ t("Edit Profile") }</Link>
          : null }
      </div>
    );
  }
}

UserInfo.defaultProps = {
  mode: "view" // used to hide the edit button if alrady in edit mode
};

export default translate()(UserInfo);
