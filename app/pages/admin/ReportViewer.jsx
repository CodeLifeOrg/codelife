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
    if (type) {
      axios.post(`/api/${type}/setstatus`, {status: "approved", id: report.report_id}).then(resp => {
        if (resp.status === 200) {
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
  }

  handleBan(type, report) {
    const {t} = this.props;
    if (type) {
      axios.post(`/api/${type}/setstatus`, {status: "banned", id: report.report_id}).then(resp => {
        if (resp.status === 200) {
          const toast = Toaster.create({className: "OKToast", position: Position.TOP_CENTER});
          toast.show({message: t("Content Banned"),
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
    }
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
    const {t} = this.props;

    if (!mounted) return <Loading />;

    const cbSorted = this.groupReports(codeblockReports);
    const pSorted = this.groupReports(projectReports);

    const codeblockItems = cbSorted.map(r => this.createRow("codeBlocks", r));
    const projectItems = pSorted.map(r => this.createRow("projects", r));

    return (
      <div id="ReportViewer">
        <h2 className="report-title">Codeblocks</h2>
        <table className="pt-table pt-striped pt-interactive">
          <thead>
            <tr>
              <th>Page</th>
              <th>Author</th>
              <th>Reasons</th>
              <th>Comments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>{codeblockItems.length > 0 ? codeblockItems : t("No items are currently flagged")}</tbody>
        </table>
        <h2 className="report-title">Projects</h2>
        <table className="pt-table pt-striped pt-interactive">
          <thead>
            <tr>
              <th>Page</th>
              <th>Author</th>
              <th>Reason</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{projectItems.length > 0 ? projectItems : t("No items are currently flagged")}</tbody>
        </table>
      </div>
    );
  }
}

ReportViewer = connect(state => ({
  auth: state.auth
}))(ReportViewer);
ReportViewer = translate()(ReportViewer);
export default ReportViewer;
