import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button, Position, Toaster, Tooltip, Intent} from "@blueprintjs/core";
import {browserHistory} from "react-router";
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

  loadFromDB() {
    const cbget = axios.get("/api/reports/codeblocks/all");
    const pget = axios.get("/api/reports/projects/all");

    Promise.all([cbget, pget]).then(resp => {
      const mounted = true;
      const codeblockReports = resp[0].data;
      const projectReports = resp[1].data;
      this.setState({mounted, codeblockReports, projectReports});
    });
  }

  componentDidMount() {
    this.loadFromDB();
  }

  handleOK(type, report) {
    const {t} = this.props;
    const reqs = [];
    for (const id of report.ids) {
      reqs.push(axios.post("/api/reports/update", {status: "approved", id}));
    }
    if (type) reqs.push(axios.post(`/api/${type}/setstatus`, {status: "approved", id: report.report_id}));
    Promise.all(reqs).then(resp => {
      if (resp.filter(r => r.status !== 200).length === 0) {
        const toast = Toaster.create({className: "OKToast", position: Position.TOP_CENTER});
        toast.show({message: t("Content Approved"), intent: Intent.SUCCESS});
      } 
      else {
        const toast = Toaster.create({className: "ErrorToast", position: Position.TOP_CENTER});
        toast.show({message: t("Database Error"), intent: Intent.DANGER});
      }
      this.loadFromDB();
    });
  }

  handleBan(type, report) {
    const {t} = this.props;
    const reqs = [];
    for (const id of report.ids) {
      reqs.push(axios.post("/api/reports/update", {status: "banned", id}));
    }
    if (type) reqs.push(axios.post(`/api/${type}/setstatus`, {status: "banned", id: report.report_id}));
    Promise.all(reqs).then(resp => {
      if (resp.filter(r => r.status !== 200).length === 0) {
        const toast = Toaster.create({className: "OKToast", position: Position.TOP_CENTER});
        toast.show({  message: t("Content Banned"), 
                      intent: Intent.DANGER, 
                      action: {
                        text: "View User Page",
                        onClick: () => browserHistory.push(`/profile/${report.username}`)
                      }});
      } 
      else {
        const toast = Toaster.create({className: "ErrorToast", position: Position.TOP_CENTER});
        toast.show({message: t("Database Error"), intent: Intent.DANGER});
      }
      this.loadFromDB();
    });
    console.log("Would ban this page:", report.report_id, report.filename);
  }

  createRow(type, report) {
    const shortFilename = report.filename.length > 20 ? `${report.filename.substring(0, 20)}...` : report.filename;
    let strReasons = "";
    let strComments = "";
    for (const r of report.reasons) strReasons += `${r}\n`;
    for (const c of report.comments) strComments += `${c}\n`;
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
        <Tooltip content="Allow this Content" position={Position.TOP}>
          <Button className="mod-button pt-button pt-intent-success pt-icon-tick" onClick={this.handleOK.bind(this, type, report)}></Button>
        </Tooltip> 
        <Tooltip content="Ban this Content" position={Position.TOP}>
          <Button className="mod-button pt-button pt-intent-danger pt-icon-delete" onClick={this.handleBan.bind(this, type, report)}></Button>
        </Tooltip>
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
              <tr>
                <th>Page</th>
                <th>Author</th>
                <th>Reasons</th>
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>{codeblockItems}</tbody>
          </table>
        </div>
        <div className="cb-report-title" style={{fontSize: "20px", fontWeight: "bold"}}>Projects</div>
        <div className="report-list">
          <table className="pt-table pt-striped pt-interactive" style={{width: "1000px"}}>
             <thead>
               <tr>
                <th>Page</th>
                <th>Author</th>
                <th>Reason</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
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
