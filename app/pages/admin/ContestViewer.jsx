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

    console.log(sortBy);

    let sortedEntries = entries;
    const {prop, desc} = sortBy;
    if (["timestamp", "project"].includes(prop)) {
      sortedEntries = entries.sort((a, b) => desc ? a[prop] < b[prop] : a[prop] >= b[prop]);
    } 
    else if (["username", "name", "email"].includes(prop)) {
      sortedEntries = entries.sort((a, b) => desc ? a.user[prop] < b.user[prop] : a.user[prop] >= b.user[prop]);
    }
    else if (["dob"].includes(prop)) {
      sortedEntries = entries.sort((a, b) => desc ? a.userprofile[prop] < b.userprofile[prop] : a.userprofile[prop] >= b.userprofile[prop]);
    } 
    /*
    else if (["geoname"].includes(prop)) {
      sortedEntries = entries.sort((a, b) => desc ? a.userprofile.geo.name < b.userprofile.geo.name : a.userprofile.geo.name >= b.userprofile.geo.name);
    }
    else if (["schoolname"].includes(prop)) {
      sortedEntries = entries.sort((a, b) => desc ? a.userprofile.school.name < b.userprofile.school.name : a.userprofile.school.name >= b.userprofile.school.name);
    }*/

    const entryList = sortedEntries.map(e =>
      <tr key={e.uid}>
        <td className="username">{e.user.username}</td>
        <td className="signedup">{e.timestamp}</td>
        <td className="name">{e.user.name}</td>
        <td className="email">{e.user.email}</td>
        <td className="geoname">{e.userprofile.geo ? e.userprofile.geo.name : null}</td>
        <td className="schoolname">{e.userprofile.school ? e.userprofile.school.name : null}</td>
        <td className="dob">{e.userprofile.dob}</td>
        <td className="project">{e.project ? <Link to={`/projects/${e.user.username}/${e.project.name}`}>{e.project.name}</Link> : null}</td>
      </tr>
    );

    return (
      <div id="contest-viewer">
        <table className="pt-table pt-striped pt-interactive">
          <thead>
            <tr>
              <th className="username" onClick={this.handleHeaderClick.bind(this, "username")}><span className={ `pt-icon-standard ${ sortBy.prop === "username" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Username</th>
              <th className="signedup" onClick={this.handleHeaderClick.bind(this, "timestamp")}><span className={ `pt-icon-standard ${ sortBy.prop === "signedup" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Signed Up</th>
              <th className="name" onClick={this.handleHeaderClick.bind(this, "name")}><span className={ `pt-icon-standard ${ sortBy.prop === "name" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Name</th>
              <th className="email" onClick={this.handleHeaderClick.bind(this, "email")}><span className={ `pt-icon-standard ${ sortBy.prop === "email" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Email</th>              
              <th className="geoname" onClick={this.handleHeaderClick.bind(this, "geoname")}><span className={ `pt-icon-standard ${ sortBy.prop === "geoname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Municipality</th>
              <th className="schoolname" onClick={this.handleHeaderClick.bind(this, "schoolname")}><span className={ `pt-icon-standard ${ sortBy.prop === "schoolname" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>School</th>
              <th className="dob" onClick={this.handleHeaderClick.bind(this, "dob")}><span className={ `pt-icon-standard ${ sortBy.prop === "dob" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>DoB</th>
              <th className="project" onClick={this.handleHeaderClick.bind(this, "project")}><span className={ `pt-icon-standard ${ sortBy.prop === "project" ? sortBy.desc ? "pt-icon-caret-down" : "pt-icon-caret-up" : "pt-icon-double-caret-vertical" }` }></span>Project</th>
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
