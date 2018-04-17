import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {NonIdealState, Popover, PopoverInteractionKind, Tab2, Tabs2} from "@blueprintjs/core";
import Loading from "components/Loading";

import "./Leaderboard.css";

class Leaderboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      users: [],
      flatProgress: [],
      sortBy: {prop: "name", desc: true}
    };
  }

  componentDidMount() {
    const sget = axios.get("/api/stats/public");

    Promise.all([sget]).then(resp => {
      const mounted = true;
      const islands = this.props.islands.map(i => Object.assign({}, i)).sort((a, b) => a.ordering - b.ordering);
      const levels = this.props.levels.map(l => Object.assign({}, l));
      let flatProgress = [];
      for (const i of islands) {
        // This filters out non-yet released islands
        // TODO: Longer term solution for active/inactive islands
        if (!["island-21a4", "island-bacb"].includes(i.id)) {
          const myLevels = levels.filter(l => l.lid === i.id).sort((a, b) => a.ordering - b.ordering);
          flatProgress = flatProgress.concat(myLevels, i);
        }
      }
      const users = resp[0].data.map(u => {
        u.progressPercent = u.userprogress.filter(up => up.status === "completed").length / flatProgress.length * 100;
        if (u.progressPercent === 0) u.progressPercent = .01;
        return u;
      });
      this.setState({mounted, users, flatProgress});
    });
  }

  handleHeaderClick(sortProp) {
    const sortBy = {prop: sortProp, desc: sortProp === this.state.sortBy.prop ? !this.state.sortBy.desc : false};
    this.setState({sortBy});
  }

  render() {

    const {mounted, flatProgress, sortBy} = this.state;
    const {t} = this.props;

    if (!mounted) return <Loading />;

    const sortedUsers = this.state.users.sort((a, b) => {
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

    const userList = sortedUsers.map(u => {

      let latestLevel = null;
      let latestTheme = "island-jungle";

      for (const fp of flatProgress) {
        if (u.userprogress.filter(up => up.status === "completed").find(up => up.level === fp.id)) {
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
        <td className="schoolname">{u.schoolname}</td>
        <td className="geoname">{u.geoname}</td>
        <td className="createdAt">{new Date(u.createdAt).toDateString()}</td>
      </tr>;
    });

    return (

      <div>

        <div id="statistics" className="content">

          <h1>{t("Leaderboard")}</h1>

          { userList.length
            ? <table className="pt-table pt-striped pt-interactive">
              <thead>
                <tr>
                  <th className="username" onClick={this.handleHeaderClick.bind(this, "username")}><span className={ `pt-icon-standard ${ sortBy.prop === "username" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>{t("Username")}</th>
                  <th className="progressPercent" onClick={this.handleHeaderClick.bind(this, "progressPercent")}><span className={ `pt-icon-standard ${ sortBy.prop === "progressPercent" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>{t("Progress")}</th>
                  <th className="name" onClick={this.handleHeaderClick.bind(this, "name")}><span className={ `pt-icon-standard ${ sortBy.prop === "name" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>{t("Name")}</th>
                  <th className="schoolname" onClick={this.handleHeaderClick.bind(this, "schoolname")}><span className={ `pt-icon-standard ${ sortBy.prop === "schoolname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>{t("School")}</th>
                  <th className="geoname" onClick={this.handleHeaderClick.bind(this, "geoname")}><span className={ `pt-icon-standard ${ sortBy.prop === "geoname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>{t("Municipality")}</th>
                  <th className="createdAt" onClick={this.handleHeaderClick.bind(this, "createdAt")}><span className={ `pt-icon-standard ${ sortBy.prop === "createdAt" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>{t("Member Since")}</th>
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

Leaderboard = connect(state => ({
  auth: state.auth,
  islands: state.islands,
  levels: state.levels
}))(Leaderboard);
Leaderboard = translate()(Leaderboard);
export default Leaderboard;
