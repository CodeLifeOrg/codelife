import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Position, Popover, PopoverInteractionKind, Intent, Toaster, Tooltip, Table, Tab2, Tabs2} from "@blueprintjs/core";
import {Treemap, LinePlot} from "d3plus-react";
import {nest} from "d3-collection";
import {max} from "d3-array";
import Loading from "components/Loading";

import "./Statistics.css";

class Statistics extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      users: [],
      visibleUsers: [],
      activeTabId: "last-1",
      flatProgress: [],
      sortBy: {prop: "createdAt", desc: true}
    };
  }

  componentDidMount() {
    const sget = axios.get("/api/stats");

    Promise.all([sget]).then(resp => {
      const mounted = true;
      const users = resp[0].data.map(u => {
        u.progressPercent = u.userprogress.length / 32 * 100;
        if (u.progressPercent === 0) u.progressPercent = .01;
        return u;
      });
      const islands = this.props.islands.map(i => Object.assign({}, i)).sort((a, b) => a.ordering - b.ordering);
      const levels = this.props.levels.map(l => Object.assign({}, l));
      let flatProgress = [];
      for (const i of islands) {
        const myLevels = levels.filter(l => l.lid === i.id).sort((a, b) => a.ordering - b.ordering);
        flatProgress = flatProgress.concat(myLevels, i);
      }
      this.setState({mounted, users, flatProgress}, this.handleTabChange.bind(this, "last-1"));
    });
  }

  daysAgo(days) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  }

  handleTabChange(activeTabId) {
    const since = Number(activeTabId.split("-")[1]);
    const visibleUsers = this.state.users.filter(u => new Date(u.createdAt) > this.daysAgo(since));
    this.setState({visibleUsers, activeTabId});
  }

  handleHeaderClick(sortProp) {
    const sortBy = {prop: sortProp, desc: sortProp === this.state.sortBy.prop ? !this.state.sortBy.desc : false};
    this.setState({sortBy}); 
  }

  render() {

    const {mounted, users, flatProgress, activeTabId} = this.state;
    const {t} = this.props;

    if (!mounted) return <Loading />;

    const visibleUsers = this.state.visibleUsers.sort((a, b) => {
      const prop1 = typeof a[this.state.sortBy.prop] === "string" ? a[this.state.sortBy.prop].toLowerCase() : a[this.state.sortBy.prop];
      const prop2 = typeof b[this.state.sortBy.prop] === "string" ? b[this.state.sortBy.prop].toLowerCase() : b[this.state.sortBy.prop];

      if (prop1 && !prop2) return -1;
      if (!prop1 && prop2) return 1;
      if (!prop1 && !prop2) return 0;
      if (this.state.sortBy.desc) {
        return prop1 < prop2 ? 1 : -1;
      }
      else {
        return prop1 > prop2 ? 1 : -1;
      }
    });

    const userList = visibleUsers.map(u => {
      
      let latestLevel = null;
      let latestTheme = "island-jungle";

      for (const fp of flatProgress) {
        if (u.userprogress.find(up => up.level === fp.id)) {
          if (fp.theme) latestTheme = fp.theme;
          latestLevel = fp;
        }
        else {
          break;
        }
      }

      let intent = "pt-intent-danger";
      if (u.progressPercent > 30 && u.progressPercent <= 60) intent = "pt-intent-warning";
      if (u.progressPercent > 60) intent = "pt-intent-success";
      return <tr key={u.id}>
        <td>{u.username}</td>
        <td>
          <Popover interactionKind={PopoverInteractionKind.HOVER}>
            <div>
              <div className={`pt-progress-bar pt-no-stripes ${intent}`} style={{width: "100px"}}>
                <div className="pt-progress-meter" style={{width: `${u.progressPercent}%`}}></div>
              </div>
            </div>
            <div style={{padding: "8px"}}>
              { latestLevel 
                ? <div>Latest Achievement:<br/><img style={{width: "20px"}} src={ `/islands/${latestTheme}-small.png` } />{latestLevel.name}</div>
                : <div>No Progress Yet</div>
              }
            </div>
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

        <Tabs2 className="admin-tabs" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
          <Tab2 id="last-1" className="admin-tab" title={t("Last Day")} />
          <Tab2 id="last-3" className="admin-tab" title={t("Last 3 Days")} />
          <Tab2 id="last-7" className="admin-tab" title={t("Last 7 Days")} />
          <Tab2 id="last-999999" className="admin-tab" title={t("Forever")} />
        </Tabs2>

        { vizData.length 
          ? <Treemap config={{
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
          : null
        }
        
        <div id="statistics">
          <table className="pt-table pt-striped pt-interactive">
            <thead>
              <tr>
                <th onClick={this.handleHeaderClick.bind(this, "username")}>Username</th>
                <th onClick={this.handleHeaderClick.bind(this, "progressPercent")}>Progress</th>
                <th onClick={this.handleHeaderClick.bind(this, "name")}>Name</th>
                <th onClick={this.handleHeaderClick.bind(this, "email")}>Email</th>
                <th onClick={this.handleHeaderClick.bind(this, "schoolname")}>School</th>
                <th onClick={this.handleHeaderClick.bind(this, "geoname")}>Geo</th>
                <th onClick={this.handleHeaderClick.bind(this, "createdAt")}>Joined on</th>
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
  auth: state.auth,
  islands: state.islands,
  levels: state.levels
}))(Statistics);
Statistics = translate()(Statistics);
export default Statistics;
