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
      users: [],
      visibleUsers: [],
      activeTabId: "last-1"
    };
  }

  componentDidMount() {
    const sget = axios.get("/api/stats");

    Promise.all([sget]).then(resp => {
      const mounted = true;
      const users = resp[0].data;
      this.setState({mounted, users}, this.handleTabChange.bind(this, "last-1"));
    });
  }

  daysAgo(days) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  }

  handleTabChange(activeTabId) {
    const since = Number(activeTabId.split("-")[1]);
    for (const u of this.state.users) {
      console.log(new Date(u.createdAt), this.daysAgo(since));
    }
    const visibleUsers = this.state.users.filter(u => new Date(u.createdAt) > this.daysAgo(since));
    this.setState({visibleUsers, activeTabId});
  }

  render() {

    const {mounted, visibleUsers, activeTabId} = this.state;
    const {t} = this.props;

    if (!mounted) return <Loading />;

    const userList = visibleUsers.map(u => {
      const progressList = u.userprogress.length ? u.userprogress.map(up => <div key={up.id}>{up.level}</div>) : <div>No Progress Yet</div>;
      const progressPercent = u.userprogress.length / 32 * 100;
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
      .entries(visibleUsers.filter(u => u.geoname));

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
        <Tabs2 className="admin-tabs" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
          <Tab2 id="last-1" className="admin-tab" title={t("Last Day")} />
          <Tab2 id="last-3" className="admin-tab" title={t("Last 3 Days")} />
          <Tab2 id="last-7" className="admin-tab" title={t("Last 7 Days")} />
          <Tab2 id="last-999999" className="admin-tab" title={t("Forever")} />
        </Tabs2>
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
              {userList.length ? userList : "No new users during this time."}
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
