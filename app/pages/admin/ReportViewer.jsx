import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";

import "./ReportViewer.css";

class ReportViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      projectReports: [],
      codeblockReports: []
    };
  }

  componentDidMount() {
    const cbget = axios.get("/api/reports/codeblocks/all");
    const pget = axios.get("/api/reports/projects/all");

    Promise.all([cbget, pget]).then(resp => {
      const mounted = true;
      const codeblockReports = resp[0].data;
      const projectReports = resp[1].data;
      this.setState({mounted, codeblockReports, projectReports});
    });
  }

  render() {

    const {mounted, codeblockReports, projectReports} = this.state;

    if (!mounted) return <Loading />;

    const codeblockItems = codeblockReports.map(r => 
      <tr key={r.id}>
        <td>{r.username}</td>
        <td>
          <a target="_blank" href={`/codeBlocks/${r.username}/${r.snippetname}`}>
            <span className="pt-icon-standard pt-icon-link" />
          </a>
        </td>
        <td>{r.reason}</td>
        <td>{r.comment}</td>
        <td>
          <Button className="mod-button pt-button pt-intent-success pt-icon-tick"></Button>
          <Button className="mod-button pt-button pt-intent-warning pt-icon-inbox"></Button>
          <Button className="mod-button pt-button pt-intent-danger pt-icon-delete"></Button>
        </td>
      </tr>
    );
    const projectItems = projectReports.map(r => 
      <tr key={r.id}>
        <td>{r.username}</td>
        <td>
          <a target="_blank" href={`/projects/${r.username}/${r.name}`}>
            <span className="pt-icon-standard pt-icon-link" />
          </a>
        </td>
        <td>{r.reason}</td>
        <td>{r.comment}</td>
        <td>
          <Button className="mod-button pt-button pt-intent-success pt-icon-tick"></Button>
          <Button className="mod-button pt-button pt-intent-warning pt-icon-inbox"></Button>
          <Button className="mod-button pt-button pt-intent-danger pt-icon-delete"></Button>
        </td>
      </tr>
    );


    return (
      <div style={{margin: "15px", padding: "15px", backgroundColor: "white"}}>
        <div id="report-title" style={{fontSize: "24px", marginBottom: "10px"}}>Flagged Content</div>
        <div className="cb-report-title" style={{fontSize: "20px", fontWeight: "bold"}}>Codeblocks</div>
        <div className="report-list" >
          <table className="pt-table pt-striped pt-interactive" style={{width: "1000px"}}>
            <thead>
              <th>Page Author</th>
              <th>Link</th>
              <th>Reason</th>
              <th>Comment</th>
              <th>Action</th>
            </thead>
            <tbody>{codeblockItems}</tbody>
          </table>
        </div>
        <div className="cb-report-title" style={{fontSize: "20px", fontWeight: "bold"}}>Projects</div>
        <div className="report-list">
          <table className="pt-table pt-striped pt-interactive" style={{width: "1000px"}}>
            <thead><th>Page Author</th><th>Link</th><th>Reason</th><th>Comment</th><th>Action</th></thead>
            <tbody>{projectItems}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

ReportViewer = connect(state => ({
  auth: state.auth
}))(ReportViewer);
ReportViewer = translate()(ReportViewer);
export default ReportViewer;
