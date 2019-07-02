import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {NonIdealState, Popover, PopoverInteractionKind, Tab2, Tabs2} from "@blueprintjs/core";
import {merge} from "d3plus-common";
import {Treemap} from "d3plus-react";
import {nest} from "d3-collection";
import LoadingSpinner from "components/LoadingSpinner";
import styles from "style.yml";

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
      const islands = this.props.islands.map(i => Object.assign({}, i)).sort((a, b) => a.ordering - b.ordering);
      const levels = this.props.levels.map(l => Object.assign({}, l));
      let flatProgress = [];
      for (const i of islands) {
        const myLevels = levels.filter(l => l.lid === i.id).sort((a, b) => a.ordering - b.ordering);
        flatProgress = flatProgress.concat(myLevels, i);
      }
      const users = resp[0].data.map(u => {
        u.progressPercent = u.userprogress.filter(up => up.status === "completed").length / flatProgress.length * 100;
        if (u.progressPercent === 0) u.progressPercent = .01;
        return u;
      });
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
      if (u.progressPercent > 60) intent = "pt-intent-primary";
      return <tr className="statistics-table-row" key={u.id}>
        <td className="statistics-table-cell username">
          <Link to={`/profile/${u.username}`} className="link">{u.username}</Link>
        </td>
        <td className="statistics-table-cell progress">
          <Popover interactionKind={PopoverInteractionKind.HOVER}>
            <div className={`pt-progress-bar pt-no-stripes ${intent}`}>
              <div className="pt-progress-meter" style={{width: `${u.progressPercent}%`}}></div>
            </div>
            { latestLevel
              ? <div>Latest Achievement:<br/><img style={{width: "20px"}} src={ `/islands/${latestTheme}-small.png` } alt="" />{latestLevel.name}</div>
              : <div>No Progress Yet</div>
            }
          </Popover>
        </td>
        <td className="statistics-table-cell name">{u.name}</td>
        <td className="statistics-table-cell email">{u.email}</td>
        <td className="statistics-table-cell schoolname">{u.schoolname}</td>
        <td className="statistics-table-cell geoname">{u.geoname}</td>
        <td className="statistics-table-cell created-at">{new Date(u.createdAt).toDateString()}</td>
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
      <div id="statistics" className="statistics">

        <h1 className="u-text-center u-margin-bottom-off">{t("Statistics")}<a title="Mais estatísticas" href="http://dashboard.codelife.com/" target="_blank"> +</a></h1>

        <div className="admin-sub-tabs-container">
          <Tabs2 className="admin-sub-tabs"
            onChange={this.handleTabChange.bind(this)}
            selectedTabId={activeTabId}
            defaultSelectedTabId="last-1">
            <Tab2 id="last-1" className="admin-sub-tab" title={t("Last Day")} />
            <Tab2 id="last-3" className="admin-sub-tab" title={t("Last 3 Days")} />
            <Tab2 id="last-7" className="admin-sub-tab" title={t("Last 7 Days")} />
            <Tab2 id="last-999999" className="admin-sub-tab" title={t("Forever")} />
          </Tabs2>
        </div>

        <div id="totals" className="totals">
          <p className="stat">
            <span className="stat-value font-xxl">{userList.length} </span>
            <span className="stat-label font-sm">Student{userList.length === 1 ? "" : "s"}</span>
          </p>
          <p className="stat">
            <span className="stat-value font-xxl">{vizData.length} </span>
            <span className="stat-label font-sm">School{vizData.length === 1 ? "" : "s"}</span>
          </p>
        </div>

        { mounted && vizData.length > 1
          ? <Treemap config={{
            height: 400,
            data: vizData,
            groupBy: "geoname",
            legend: false,
            shapeConfig: {
              fill: () => styles["sky-dark"],
              labelConfig: {
                fontFamily: styles["body-font"]
              }
            },
            tooltipConfig: {
              background: styles.white,
              body: v => {
                const students = v.uid instanceof Array ? v.uid.length : 1;
                const schools = v.schoolname instanceof Array ? v.schoolname : [v.schoolname];
                return `<table class="school-tooltip-table">
                          <tr><td>School${ schools.length > 1 ? "s" : "" }:</td><td>${schools.length}</tr>
                          <tr><td>Student${ students > 1 ? "s" : "" }:</td><td>${students}</tr>
                        </table>`;
              },
              bodyStyle: {
                "font-family": styles["body-font"]
              },
              borderRadius: styles["radius-md"],
              padding: styles["radius-lg"],
              titleStyle: {
                "font-family": styles["body-font"]
              }
            }
          }} />
          : null
        }

        { mounted && userList.length
          ? <table className="statistics-table pt-table">
            <thead className="statistics-table-header">
              <tr className="statistics-table-header-row statistics-table-row">
                {/* username */}
                <th className="statistics-table-heading statistics-table-cell username" onClick={this.handleHeaderClick.bind(this, "username")}>
                  <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "username" ? sortBy.desc ? "pt-icon-sort-alphabetical" : "pt-icon-sort-alphabetical-desc" : "pt-icon-double-caret-vertical" }` } />
                  {t("Username")}
                </th>
                {/* progress */}
                <th className="statistics-table-heading statistics-table-cell progressPercent" onClick={this.handleHeaderClick.bind(this, "progressPercent")}>
                  <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "progressPercent" ? sortBy.desc ? "pt-icon-sort-desc" : "pt-icon-sort-asc" : "pt-icon-double-caret-vertical" }` } />
                  {t("Progress")}
                </th>
                {/* name */}
                <th className="statistics-table-heading statistics-table-cell name" onClick={this.handleHeaderClick.bind(this, "name")}>
                  <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "name" ? sortBy.desc ? "pt-icon-sort-alphabetical" : "pt-icon-sort-alphabetical-desc" : "pt-icon-double-caret-vertical" }` } />
                  {t("Name")}
                </th>
                {/* email */}
                <th className="statistics-table-heading statistics-table-cell email" onClick={this.handleHeaderClick.bind(this, "email")}>
                  <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "email" ? sortBy.desc ? "pt-icon-sort-alphabetical" : "pt-icon-sort-alphabetical-desc" : "pt-icon-double-caret-vertical" }` } />
                  {t("Email")}
                </th>
                {/* school */}
                <th className="statistics-table-heading statistics-table-cell schoolname" onClick={this.handleHeaderClick.bind(this, "schoolname")}>
                  <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "schoolname" ? sortBy.desc ? "pt-icon-sort-alphabetical" : "pt-icon-sort-alphabetical-desc" : "pt-icon-double-caret-vertical" }` } />
                  {t("School")}
                </th>
                {/* municipality */}
                <th className="statistics-table-heading statistics-table-cell geoname" onClick={this.handleHeaderClick.bind(this, "geoname")}>
                  <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "geoname" ? sortBy.desc ? "pt-icon-sort-alphabetical" : "pt-icon-sort-alphabetical-desc" : "pt-icon-double-caret-vertical" }` } />
                  {t("Municipality")}
                </th>
                {/* joined on */}
                <th className="statistics-table-heading statistics-table-cell created-at" onClick={this.handleHeaderClick.bind(this, "createdAt")}>
                  <span className={ `statistics-icon pt-icon-standard ${ sortBy.prop === "createdAt" ? sortBy.desc ? "pt-icon-sort-numerical" : "pt-icon-sort-numerical-desc" : "pt-icon-double-caret-vertical" }` } />
                  {t("Joined on")}
                </th>
              </tr>
            </thead>
            <tbody className="statistics-table-body">
              { userList }
            </tbody>
          </table>
          : mounted
            ? <NonIdealState visual="time" title={t("No Data Available")} description={t("There were no new accounts created during the selected period")} />
            : <LoadingSpinner label={false} />
        }

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
