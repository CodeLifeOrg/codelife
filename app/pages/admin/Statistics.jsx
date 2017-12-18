import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Position, Popover, PopoverInteractionKind, Intent, Toaster, Tooltip, Table, Tab2, Tabs2} from "@blueprintjs/core";
import {Treemap} from "d3plus-react";
import {nest} from "d3-collection";
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

    const userList = users.map(u => {
      const progressList = u.userprogress.length ? u.userprogress.map(up => <div key={up.id}>{up.level}</div>) : <div>No Progress Yet</div>;
      const progressPercent = u.userprogress.length / 26 * 100;
      let intent = "pt-intent-danger";
      if (progressPercent > 30 && progressPercent <= 60) intent = "pt-intent-warning";
      if (progressPercent > 60) intent = "pt-intent-success";
      return <tr key={u.id}>
        <td>
          <Popover interactionKind={PopoverInteractionKind.HOVER}>
            <div>
              {u.username}
              <div className={`pt-progress-bar pt-no-stripes ${intent}`} style={{width: "100px"}}>
                <div className="pt-progress-meter" style={{width: `${progressPercent}%`}}></div>
              </div>
            </div>
            <div style={{padding: "5px"}}>{progressList}</div>
          </Popover>
        </td>
        <td>{u.name}</td>
        <td>{u.email}</td>
        <td>{u.schoolname}</td>
        <td>{u.geoname}</td>
        <td>{new Date(u.createdAt).toDateString()}</td>
      </tr>;
    });

    const vizData = nest().key(u => u.geoname)
      .rollup(leaves => leaves.length)
      .entries(users.filter(u => u.geoname));

    return (
      
      <div>
        <Treemap config={{
          height: 400,
          data: vizData,
          groupBy: "key",
          tooltipConfig: {
            body: v => {
              const count = v.value;
              return `Count: ${count}`;
            }
          }
        }} />
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
      </div>
    );
  }
}

Statistics = connect(state => ({
  auth: state.auth
}))(Statistics);
Statistics = translate()(Statistics);
export default Statistics;
