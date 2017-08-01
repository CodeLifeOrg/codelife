import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";
import "./Profile.css";

/**
 * Class component for displaying lists of user's snippets.
 * This is shown on the public profile for a user and requires sending
 * 1 prop: a ref to the user
 */
class UsersList extends Component {

  /**
   * Creates the UserSnippets component with initial state.
   * @param {boolean} loading - true by defaults gets flipped post AJAX.
   * @param {array} snippets - Gets set by AJAX call from DB call.
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      users: []
    };
  }

  /**
   * Grabs user id from user prop, makes AJAX call to server and returns
   * the list of snippets.
   */
  componentDidMount() {
    const {type, user} = this.props;
    const apiUrl = type === "geo" ? `/api/usersByGid/${user.gid}` : `/api/usersBySid/${user.sid}`;
    axios.get(apiUrl).then(resp => {
      this.setState({loading: false, users: resp.data});
    });
  }

  renderUsers(users) {
    const {user: me} = this.props;
    // remove myself
    if (!users.length) {
      return
    }
    return users.map((user, i) =>
      <div className="pt-card pt-elevation-0 pt-interactive">
        {user.img
          ? <div className="user-img" style={{backgroundImage: `url(/uploads/${user.img})`}}></div>
          : <span className="pt-icon-large pt-icon-user pt-intent-primary"></span>}
        <h5><a href="#">{user.name}</a></h5>
        <p>{user.bio}</p>
      </div>
    );
  }

  render() {
    const {user: me, t, type} = this.props;
    const {loading} = this.state;
    let {users} = this.state;

    if (loading) return <h2>{ t("Loading snipppets...") }</h2>;
    let title;
    if (type === "geo") {
      title = `Other users from ${me.geoname}, ${me.gid.substr(1, 2).toUpperCase()}`;
    }
    else {
      title = `Other users from ${me.schoolname}`;
    }
    // remove myself
    users = users.filter(u => u.id !== me.id);

    return (
      <div className="user-section">
        <h2>{title}</h2>
        <ul>
        { users.length
          ? this.renderUsers(users)
          : <p>{ t("No other users found.") }</p>}
        </ul>
      </div>
    );
  }
}

export default translate()(UsersList);
