import React, {Component} from "react";
import {Link} from "react-router";

import "./UserCard.css";

export default class UserCard extends Component {

  render() {

    const {bio, img, name, username} = this.props.user;

    return (
      <Link to={ `/profile/${username}` } className="userCard pt-card pt-elevation-0 pt-interactive" key={username}>
        <div className="box">
          <div className="icon user" style={{backgroundImage: img ? `url(/uploads/${img})` : "none"}}>
            {img ? null : <span className="pt-icon-standard pt-icon-user pt-intent-primary" /> }
          </div>
          <div className="info">
            <div className="card-title">{ name }</div>
            { bio ? <div className="card-author">{ bio }</div> : null }
          </div>
        </div>
      </Link>
    );
  }
}
