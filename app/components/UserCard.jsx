import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";

import "./UserCard.css";

class UserCard extends Component {

  render() {

    const {t} = this.props;
    const {bio, id, img, name, username} = this.props.user;

    // define user image as null
    let avatarURL = null;

    // get corresponding user image
    if (img) {
      avatarURL = `/uploads/${img}`;
    }

    return (

      <div className="card-container" key={username}>

        {/* cover link */}
        <Link
          className="card-trigger u-absolute-expand"
          to={ `/profile/${username}` }
          aria-labelledby={ username /* uses .card-title ID */ } />

        {/* card inner */}
        <div className="user-card card">

          {/* show thumbnail image if one is found */}
          { img
            ? <div className="card-avatar" style={{backgroundImage: `url(${avatarURL})`}} />
            : <div className="card-avatar">
              <span className="card-avatar-icon pt-icon pt-icon-person" />
            </div>
          }

          {/* caption */}
          <div className="card-caption">

            {/* title */}
            <h4 className="card-title u-margin-top-off u-margin-bottom-off" id={ username }>{ name }</h4>

            { bio ? <p className="card-bio font-xs u-margin-bottom-off">{ bio }</p> : null }

          </div>
        </div>
      </div>
    );
  }
}

UserCard = translate()(UserCard);
export default UserCard;
