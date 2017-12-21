import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {NonIdealState, Popover, PopoverInteractionKind, Tab2, Tabs2} from "@blueprintjs/core";
import {merge} from "d3plus-common";
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

    const {mounted, flatProgress, activeTabId, sortBy} = this.state;
    const {t} = this.props;

    if (!mounted) return <Loading />;

    const visibleUsers = this.state.visibleUsers.sort((a, b) => {
      const prop1 = typeof a[sortBy.prop] === "string" ? a[sortBy.prop].toLowerCase() : a[sortBy.prop];
      const prop2 = typeof b[sortBy.prop] === "string" ? b[sortBy.prop].toLowerCase() : b[sortBy.prop];

      if (prop1 && !prop2) return -1;
      if (!prop1 && prop2) return 1;
      if (!prop1 && !prop2) return 0;
      if (sortBy.desc) {
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
        <td className="username">{u.username}</td>
        <td className="progressPercent">
          <Popover interactionKind={PopoverInteractionKind.HOVER}>
            <div>
              <div className={`pt-progress-bar pt-no-stripes ${intent}`}>
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
        <td className="name">{u.name}</td>
        <td className="email">{u.email}</td>
        <td className="schoolname">{u.schoolname}</td>
        <td className="geoname">{u.geoname}</td>
        <td className="createdAt">{new Date(u.createdAt).toDateString()}</td>
      </tr>;
    });

    const vizData = [];
    nest().key(u => u.geoname)
      .rollup(leaves => {
        const d = merge(leaves);
        d.value = leaves.length;
        vizData.push(d);
        return leaves.length;
      })
      .entries(visibleUsers.filter(u => u.geoname));

    return (

      <div>

        <Tabs2 className="stat-tabs" onChange={this.handleTabChange.bind(this)} selectedTabId={activeTabId}>
          <Tab2 id="last-1" className="stat-tab" title={t("Last Day")} />
          <Tab2 id="last-3" className="stat-tab" title={t("Last 3 Days")} />
          <Tab2 id="last-7" className="stat-tab" title={t("Last 7 Days")} />
          <Tab2 id="last-999999" className="stat-tab" title={t("Forever")} />
        </Tabs2>

        <div id="statistics">

          <div id="totals">
            <span className="stat">Number of Students: <span className="value">{userList.length}</span></span>
            <span className="stat">Number of Schools: <span className="value">{vizData.length}</span></span>
          </div>

          { vizData.length > 1
            ? <Treemap config={{
              height: 400,
              data: vizData,
              groupBy: "geoname",
              legend: false,
              shapeConfig: {
                fill: () => "#ba1c2e",
                labelConfig: {
                  fontFamily: "Overpass"
                }
              },
              tooltipConfig: {
                background: "white",
                body: v => {
                  const students = v.uid instanceof Array ? v.uid.length : 1;
                  const schools = v.schoolname instanceof Array ? v.schoolname : [v.schoolname];
                  return `<table class="school-tooltip-table">
                            <tr><td>School${ schools.length > 1 ? "s" : "" }:</td><td>${schools.length}</tr>
                            <tr><td>Student${ students > 1 ? "s" : "" }:</td><td>${students}</tr>
                          </table>`;
                },
                bodyStyle: {
                  "font-family": "Overpass"
                },
                borderRadius: "5px",
                padding: "10px",
                titleStyle: {
                  "font-family": "Overpass"
                }
              }
            }} />
            : null
          }

          { userList.length
            ? <table className="pt-table pt-striped pt-interactive">
              <thead>
                <tr>
                  <th className="username" onClick={this.handleHeaderClick.bind(this, "username")}><span className={ `pt-icon-standard ${ sortBy.prop === "username" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Username</th>
                  <th className="progressPercent" onClick={this.handleHeaderClick.bind(this, "progressPercent")}><span className={ `pt-icon-standard ${ sortBy.prop === "progressPercent" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Progress</th>
                  <th className="name" onClick={this.handleHeaderClick.bind(this, "name")}><span className={ `pt-icon-standard ${ sortBy.prop === "name" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Name</th>
                  <th className="email" onClick={this.handleHeaderClick.bind(this, "email")}><span className={ `pt-icon-standard ${ sortBy.prop === "email" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Email</th>
                  <th className="schoolname" onClick={this.handleHeaderClick.bind(this, "schoolname")}><span className={ `pt-icon-standard ${ sortBy.prop === "schoolname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>School</th>
                  <th className="geoname" onClick={this.handleHeaderClick.bind(this, "geoname")}><span className={ `pt-icon-standard ${ sortBy.prop === "geoname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Municipality</th>
                  <th className="createdAt" onClick={this.handleHeaderClick.bind(this, "createdAt")}><span className={ `pt-icon-standard ${ sortBy.prop === "createdAt" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Joined on</th>
                </tr>
              </thead>
              <tbody>
                { userList }
              </tbody>
            </table>
            : <NonIdealState visual="time" title="No Data Available" description="There were no new accounts created during the selected period." /> }

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
