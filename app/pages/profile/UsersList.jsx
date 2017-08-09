import axios from "axios";
import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";
import "./Profile.css";

import UserCard from "components/UserCard";

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

  render() {
    const {user: me, t, type} = this.props;
    const {loading} = this.state;
    let {users} = this.state;

    if (loading) return <h2>{ t("Loading codeblocks") }...</h2>;
    let title;
    if (type === "geo") {
      // title = `Other users from ${me.geoname}, ${me.gid.substr(1, 2).toUpperCase()}`;
      title = t("usersByLocation", {municipality: me.geoname, state: me.gid.substr(1, 2).toUpperCase()});
    }
    else {
      // title = `Other users from ${me.schoolname}`;
      title = t("usersBySchool", {school: me.schoolname});
    }
    // remove myself
    users = users.filter(u => u.id !== me.id);

    return (
      <div className="user-section">
        <h2>{title}</h2>
        { users.length
          ? <div className="flex-row">{ users.map(user => <UserCard user={user} />) }</div>
          : <p>{ t("No other users found.") }</p>}
      </div>
    );
  }
}

export default translate()(UsersList);
