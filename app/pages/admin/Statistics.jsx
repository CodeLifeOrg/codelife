import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Position, Toaster, Tooltip, Table, Intent, Tab2, Tabs2} from "@blueprintjs/core";
import Loading from "components/Loading";

import "./Statistics.css";

class Statistics extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      users: []
    };
  }

  componentDidMount() {
    const sget = axios.get("/api/stats");

    Promise.all([sget]).then(resp => {
      const mounted = true;
      const users = resp[0].data;
      this.setState({mounted, users});
    });

  }

  render() {

    const {mounted, users} = this.state;

    if (!mounted) return <Loading />;

    const userList = users.map(u => 
      <tr key={u.id}>
        <td>{u.username}</td>
        <td>{u.name}</td>
        <td>{u.email}</td>
        <td>{u.schoolname}</td>
        <td>{u.geoname}</td>
        <td>{new Date(u.createdAt).toDateString()}</td>
      </tr>
    );

    return (
      <div id="statistics">
        <table className="pt-table pt-striped pt-interactive">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>School</th>
              <th>Geo</th>
              <th>Joined on</th>
            </tr>
          </thead>
          <tbody>
            {userList}
          </tbody>
        </table>
      </div>
    );
  }
}

Statistics = connect(state => ({
  auth: state.auth
}))(Statistics);
Statistics = translate()(Statistics);
export default Statistics;
