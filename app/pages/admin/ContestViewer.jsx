import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {translate} from "react-i18next";
import Loading from "components/Loading";

import "./ContestViewer.css";

class ContestViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      entries: [],
      sortBy: {prop: "timestamp", desc: true}
    };
  }

  componentDidMount() {
    axios.get("/api/contest/admin").then(resp => {
      const mounted = true;
      const entries = resp.data;
      this.setState({mounted, entries});
    });
  }

  handleHeaderClick(sortProp) {
    const sortBy = {prop: sortProp, desc: sortProp === this.state.sortBy.prop ? !this.state.sortBy.desc : false};
    this.setState({sortBy});
  }

  render() {

    const {mounted, entries, sortBy} = this.state;

    if (!mounted) return <Loading />;

    console.log(entries);

    const entryList = entries.map(e =>
      <tr key={e.uid}>
        <td className="username">{e.user.username}</td>
        <td className="name">{e.user.name}</td>
        <td className="email">{e.user.email}</td>
        <td className="geoname">{e.userprofile.geo ? e.userprofile.geo.name : null}</td>
        <td className="schoolname">{e.userprofile.school ? e.userprofile.school.name : null}</td>
        <td className="project">{e.project ? <Link to={`/projects/${e.user.username}/${e.project.name}`}>{e.project.name}</Link> : null}</td>
      </tr>
    );

    return (
      <div id="contest-viewer">
        <table className="pt-table pt-striped pt-interactive">
          <thead>
            <tr>
              <th className="username" onClick={this.handleHeaderClick.bind(this, "username")}><span className={ `pt-icon-standard ${ sortBy.prop === "username" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Username</th>
              <th className="name" onClick={this.handleHeaderClick.bind(this, "progressPercent")}><span className={ `pt-icon-standard ${ sortBy.prop === "progressPercent" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Name</th>
              <th className="email" onClick={this.handleHeaderClick.bind(this, "email")}><span className={ `pt-icon-standard ${ sortBy.prop === "email" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Email</th>              
              <th className="geoname" onClick={this.handleHeaderClick.bind(this, "geoname")}><span className={ `pt-icon-standard ${ sortBy.prop === "geoname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Municipality</th>
              <th className="schoolname" onClick={this.handleHeaderClick.bind(this, "schoolname")}><span className={ `pt-icon-standard ${ sortBy.prop === "schoolname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>School</th>
              <th className="project" onClick={this.handleHeaderClick.bind(this, "project")}><span className={ `pt-icon-standard ${ sortBy.prop === "schoolname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Project</th>
            </tr>
          </thead>
          <tbody>
            {entryList}
          </tbody>
        </table>
      </div>
    );
  }
}

ContestViewer = connect(state => ({
  auth: state.auth
}))(ContestViewer);
ContestViewer = translate()(ContestViewer);
export default ContestViewer;
