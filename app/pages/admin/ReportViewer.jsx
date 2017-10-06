import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Position, Popover, PopoverInteractionKind} from "@blueprintjs/core";
import Loading from "components/Loading";

import "./ReportViewer.css";

class ReportViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      projectReports: [],
      codeblockReports: [],
      isOpen: false
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

  handleOK(report) {
    console.log("Would set these reports to HANDLED:", report.ids);
    console.log("Would restore this page:", report.report_id, report.filename);
  }

  handleEmail(report) {
    console.log("Would email this address:", report.email);
  }

  handleBan(report) {
    console.log("Would set these reports to HANDLED:", report.ids);
    console.log("Would ban this page:", report.report_id, report.filename);
  }

  createRow(type, report) {
    const shortFilename = report.filename.length > 20 ? `${report.filename.substring(0, 20)}...` : report.filename;
    const strReasons = report.reasons.toString().replace(",", "\n");
    const strComments = report.comments.toString().replace(",", "\n");
    return <tr key={report.id}>
      <td>
        <a target="_blank" href={`/${type}/${report.username}/${report.filename}`}>
          {shortFilename}
        </a>
      </td>
      <td>{report.username}</td>
      <td style={{whiteSpace: "pre-wrap"}}>{strReasons}</td>
      <td style={{whiteSpace: "pre-wrap"}}>{strComments}</td>
      <td>
        <Button className="mod-button pt-button pt-intent-success pt-icon-tick" onClick={this.handleOK.bind(this, report)}></Button>
        <Button className="mod-button pt-button pt-intent-warning pt-icon-inbox" onClick={this.handleEmail.bind(this, report)}></Button>
        <Button className="mod-button pt-button pt-intent-danger pt-icon-delete" onClick={this.handleBan.bind(this, report)}></Button>
      </td>
    </tr>;
  }

  groupReports(reports) {
    const grouped = [];
    for (const report of reports) {
      const gr = grouped.find(gr => gr.report_id === report.report_id);
      if (gr) {
        gr.ids.push(report.id);
        gr.reasons.push(report.reason);
        gr.comments.push(report.comment);
      }
      else {
        const obj = {
          ids: [report.id],
          report_id: report.report_id,
          username: report.username,
          email: report.email,
          filename: report.filename,
          reasons: [report.reason],
          comments: [report.comment]
        };
        grouped.push(obj);
      }
    }
    return grouped;
  }

  render() {

    const {mounted, codeblockReports, projectReports} = this.state;

    if (!mounted) return <Loading />;

    const cbSorted = this.groupReports(codeblockReports);
    const pSorted = this.groupReports(projectReports);

    const codeblockItems = cbSorted.map(r => this.createRow("codeBlocks", r));
    const projectItems = pSorted.map(r => this.createRow("projects", r));

    return (
      <div style={{margin: "15px", padding: "15px", backgroundColor: "white"}}>
        <div id="report-title" style={{fontSize: "24px", marginBottom: "10px"}}>Flagged Content</div>
        <div className="cb-report-title" style={{fontSize: "20px", fontWeight: "bold"}}>Codeblocks</div>
        <div className="report-list" >
          <table className="pt-table pt-striped pt-interactive" style={{width: "1000px"}}>
            <thead>
              <th>Page</th>
              <th>Author</th>
              <th>Reasons</th>
              <th>Comments</th>
              <th>Action</th>
            </thead>
            <tbody>{codeblockItems}</tbody>
          </table>
        </div>
        <div className="cb-report-title" style={{fontSize: "20px", fontWeight: "bold"}}>Projects</div>
        <div className="report-list">
          <table className="pt-table pt-striped pt-interactive" style={{width: "1000px"}}>
             <thead>
              <th>Page</th>
              <th>Author</th>
              <th>Reason</th>
              <th>Comments</th>
              <th>Actions</th>
            </thead>
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
