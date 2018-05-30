import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import PropTypes from "prop-types";
import {NonIdealState, Popover, PopoverInteractionKind} from "@blueprintjs/core";
import LoadingSpinner from "components/LoadingSpinner";
import {Link} from "react-router";

import "./Leaderboard.css";

class Leaderboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      users: [],
      flatProgress: [],
      sortBy: {prop: "progressPercent", desc: true}
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
      }).filter(u => u.progressPercent > .01);
      this.setState({mounted, users, flatProgress});
    });
  }

  handleHeaderClick(sortProp) {
    const sortBy = {prop: sortProp, desc: sortProp === this.state.sortBy.prop ? !this.state.sortBy.desc : false};
    this.setState({sortBy});
  }

  formatDate(date) {
    const ds = new Date(date).toDateString();
    return ds.substr(ds.indexOf(" ") + 1);
  }

  render() {

    const {mounted, flatProgress, sortBy} = this.state;
    const {browserHistory} = this.context;
    const {t} = this.props;

    if (!this.props.auth.user) browserHistory.push("/");

    if (!mounted) return <LoadingSpinner />;

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

      const intent = "pt-intent-primary";
      // if (u.progressPercent > 30 && u.progressPercent <= 60) intent = "pt-intent-warning";
      // if (u.progressPercent > 60) intent = "pt-intent-primary";
      return <tr className="statistics-table-row" key={u.id}>
        <td className="statistics-table-cell username">
          <Link to={`/profile/${u.username}`}>{u.username}</Link>
        </td>
        <td className="statistics-table-cell progress">
          <Popover interactionKind={PopoverInteractionKind.HOVER}>
            <div className={`pt-progress-bar pt-no-stripes ${intent}`}>
              <div className="pt-progress-meter" style={{width: `${u.progressPercent}%`}}></div>
            </div>
            <div style={{padding: "8px"}}>
              { latestLevel
                ? <div>Latest Achievement:<br/><img style={{width: "20px"}} src={ `/islands/${latestTheme}-small.png` } />{latestLevel.name}</div>
                : <div>No Progress Yet</div>
              }
            </div>
          </Popover>
        </td>
        <td className="statistics-table-cell name">{u.name}</td>
        <td className="statistics-table-cell schoolname">{u.schoolname}</td>
        <td className="statistics-table-cell geoname">{u.geoname}</td>
        <td className="statistics-table-cell created-at">{this.formatDate(u.createdAt)}</td>
        {/*<td className="statistics-table-cell updated-at">{new Date(u.updatedAt).toDateString()}</td>*/}
      </tr>;
    });

    return (
      <div className="statistics content">
        <div className="content-section">

          <h1 className="statistics-heading font-xxl u-text-center">{t("Leaderboard")}</h1>

          { userList.length
            ? <table className="statistics-table pt-table">
              <thead className="statistics-table-header">
                <tr className="statistics-table-header-row statistics-table-row">
                  {/* username */}
                  <th className="statistics-table-heading statistics-table-cell username" onClick={this.handleHeaderClick.bind(this, "username")}>
                    <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "username" ? sortBy.desc ? "pt-icon-sort-alphabetical-desc" : "pt-icon-sort-alphabetical" : "pt-icon-double-caret-vertical" }` } />
                    {t("Username")}
                  </th>
                  {/* progress */}
                  <th className="statistics-table-heading statistics-table-cell progressPercent" onClick={this.handleHeaderClick.bind(this, "progressPercent")}>
                    <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "progressPercent" ? sortBy.desc ? "pt-icon-sort-desc" : "pt-icon-sort-asc" : "pt-icon-double-caret-vertical" }` } />
                    {t("Progress")}
                  </th>
                  {/* name */}
                  <th className="statistics-table-heading statistics-table-cell name" onClick={this.handleHeaderClick.bind(this, "name")}>
                    <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "name" ? sortBy.desc ? "pt-icon-sort-alphabetical-desc" : "pt-icon-sort-alphabetical" : "pt-icon-double-caret-vertical" }` } />
                    {t("Name")}
                  </th>
                  {/* school */}
                  <th className="statistics-table-heading statistics-table-cell schoolname" onClick={this.handleHeaderClick.bind(this, "schoolname")}>
                    <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "schoolname" ? sortBy.desc ? "pt-icon-sort-alphabetical-desc" : "pt-icon-sort-alphabetical" : "pt-icon-double-caret-vertical" }` } />
                    {t("School")}
                  </th>
                  {/* municipality */}
                  <th className="statistics-table-heading statistics-table-cell geoname" onClick={this.handleHeaderClick.bind(this, "geoname")}>
                    <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "geoname" ? sortBy.desc ? "pt-icon-sort-alphabetical-desc" : "pt-icon-sort-alphabetical" : "pt-icon-double-caret-vertical" }` } />
                    {t("Municipality")}
                  </th>
                  {/* member since */}
                  <th className="statistics-table-heading statistics-table-cell created-at" onClick={this.handleHeaderClick.bind(this, "createdAt")}>
                    <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "createdAt" ? sortBy.desc ? "pt-icon-sort-numerical-desc" : "pt-icon-sort-numerical" : "pt-icon-double-caret-vertical" }` } />
                    {t("Member Since")}
                  </th>
                  {/* last login */}
                  {/*
                  <th className="statistics-table-heading statistics-table-cell created-at" onClick={this.handleHeaderClick.bind(this, "createdAt")}>
                    <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "updatedAt" ? sortBy.desc ? "pt-icon-sort-numerical-desc" : "pt-icon-sort-numerical" : "pt-icon-double-caret-vertical" }` } />
                    {t("Last Login")}
                  </th>
                  */}
                </tr>
              </thead>
              <tbody className="statistics-table-body">
                { userList }
              </tbody>
            </table>
            : <NonIdealState visual="time" title="No Data Available" description="There were no new accounts created during the selected period." /> }
        </div>
      </div>
    );
  }
}

Leaderboard.contextTypes = {
  browserHistory: PropTypes.object
};

Leaderboard = connect(state => ({
  auth: state.auth,
  islands: state.islands,
  levels: state.levels
}))(Leaderboard);
Leaderboard = translate()(Leaderboard);
export default Leaderboard;
