import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {button, Position, Toaster, Tooltip, Intent} from "@blueprintjs/core";
import PropTypes from "prop-types";
import Thread from "components/Thread";
import Comment from "components/Comment";
import LoadingSpinner from "components/LoadingSpinner";

import "./ReportViewer.css";

class ReportViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      projectReports: [],
      codeblockReports: [],
      threadReports: [],
      commentReports: [],
      reports: [],
      isOpen: false
    };
  }

  loadFromDB() {
    const cbget = axios.get("/api/reports/codeblocks/all");
    const pget = axios.get("/api/reports/projects/all");
    const tget = axios.get("/api/reports/threads/all");
    const cget = axios.get("/api/reports/comments/all");
    const rget = axios.get("/api/reports/discussions");

    Promise.all([cbget, pget, tget, cget, rget]).then(resp => {
      const mounted = true;
      const codeblockReports = resp[0].data;
      const projectReports = resp[1].data;
      const threadReports = resp[2].data;
      const commentReports = resp[3].data;
      const reports = resp[4].data;
      this.setState({mounted, codeblockReports, projectReports, threadReports, commentReports, reports});
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
    const {browserHistory} = this.context;
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

  createPageRow(type, report) {
    const shortFilename = report.filename.length > 35 ? `${report.filename.substring(0, 35)}...` : report.filename;
    let strReasons = "";
    let strComments = "";
    for (const r of report.reasons) strReasons += `<li>${r}</li>`;
    for (const c of report.comments) c.length ? strComments += `<li>${c}</li>` : null;
    return <tr key={report.id}>
      <td>
        <Link target="_blank" to={`/${type}/${report.username}/${report.filename}`}>
          {shortFilename}
        </Link>
      </td>
      <td>
        <Link to={`/profile/${report.username}`}>
          {report.username}
        </Link>
      </td>
      <td>
        <ul className="font-xs u-margin-top-off u-margin-bottom-off" dangerouslySetInnerHTML={{__html: strReasons}} />
      </td>
      <td>
        <ul className="font-xs u-margin-top-off u-margin-bottom-off" dangerouslySetInnerHTML={{__html: strComments}} />
      </td>
      <td className="actions-cell font-xs">
        <span className="actions-cell-inner u-button-group">
          <button className="inverted-button button success" onClick={this.handleOK.bind(this, type, report)}>
            <span className="pt-icon pt-icon-tick" />
            <span className="u-hide-below-md">allow</span>
          </button>
          <button className="inverted-button button danger-button" onClick={this.handleBan.bind(this, type, report)}>
            <span className="pt-icon pt-icon-trash" />
            <span className="u-hide-below-md">ban</span>
          </button>
        </span>
      </td>
    </tr>;
  }

  createDiscRow(type, report) {
    // if (report.commentref) author = report.commentref.user.username;
    // if (report.thread) author = report.thread.user.username;
    let strReasons = "";
    let strComments = "";
    for (const r of report.reasons) strReasons += `<li>${r}</li>`;
    for (const c of report.comments) c.length ? strComments += `<li>${c}</li>` : null;
    return <tr key={report.id}>
      {
        type === "threads"
          ? <Thread thread={report.thread} context="admin" />
          : <Comment comment={report.commentref} context="admin" />
      }
      <td>
        <ul className="font-xs u-margin-top-off u-margin-bottom-off" dangerouslySetInnerHTML={{__html: strReasons}} />
      </td>
      <td>
        <ul className="font-xs u-margin-top-off u-margin-bottom-off" dangerouslySetInnerHTML={{__html: strComments}} />
      </td>
      <td className="actions-cell font-xs">
        <span className="actions-cell-inner u-button-group">
          <button className="inverted-button button success" onClick={this.handleOK.bind(this, type, report)}>
            <span className="pt-icon pt-icon-tick" />
            <span className="u-hide-below-md">allow</span>
          </button>
          <button className="inverted-button button danger-button" onClick={this.handleBan.bind(this, type, report)}>
            <span className="pt-icon pt-icon-trash" />
            <span className="u-hide-below-md">ban</span>
          </button>
        </span>
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
          commentref: report.commentref,
          thread: report.thread,
          email: report.email,
          filename: report.filename,
          reasons: [report.reason],
          comments: [report.comment],
          permalink: report.permalink
        };
        grouped.push(obj);
      }
    }
    return grouped;
  }

  render() {

    const {mounted, codeblockReports, projectReports, threadReports, commentReports} = this.state;
    const {t} = this.props;

    const cbSorted = this.groupReports(codeblockReports);
    const pSorted = this.groupReports(projectReports);
    const tSorted = this.groupReports(threadReports);
    const cSorted = this.groupReports(commentReports);

    const codeblockItems = cbSorted.map(r => this.createPageRow("codeBlocks", r));
    const projectItems = pSorted.map(r => this.createPageRow("projects", r));
    const threadItems = tSorted.map(r => this.createDiscRow("threads", r));
    const commentItems = cSorted.map(r => this.createDiscRow("comments", r));

    return (
      <div id="ReportViewer">
        <h1 className="font-xl u-text-center u-margin-bottom-off">Flagged content</h1>

        { mounted
          // no flagged content in the queue
          ? codeblockItems.length === 0 && projectItems.length === 0 && threadItems.length === 0 && commentItems.length === 0 &&
          <p className="font-md u-text-center u-margin-top-md">{t("No items are currently flagged")} 🙌</p>
          // still loading
          : <LoadingSpinner label={false} />
        }

        { codeblockItems.length > 0 &&
          <div className="report-section">
            <h3 className="report-title font-md u-margin-bottom-off">Codeblocks</h3>
            <table className="codeblock-report-table pt-table u-margin-bottom-lg">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Author</th>
                  <th>Reasons</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{codeblockItems}</tbody>
            </table>
          </div>
        }

        { projectItems.length > 0 &&
          <div className="report-section">
            <h3 className="report-title font-md u-margin-bottom-off">Projects</h3>
            <table className="project-report-table pt-table u-margin-bottom-lg">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Author</th>
                  <th>Reasons</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{projectItems}</tbody>
            </table>
          </div>
        }

        { threadItems.length > 0 &&
          <div className="report-section">
            <h3 className="report-title font-md u-margin-bottom-off">Threads</h3>
            <table className="thread-report-table pt-table u-margin-bottom-lg">
              <thead>
                <tr>
                  <th>Thread</th>
                  <th>Reasons</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{threadItems}</tbody>
            </table>
          </div>
        }

        { commentItems.length > 0 &&
          <div className="report-section">
            <h3 className="report-title font-md u-margin-bottom-off">Comments</h3>
            <table className="comment-report-table pt-table u-margin-bottom-lg">
              <thead>
                <tr>
                  <th>Comment</th>
                  <th>Reasons</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{commentItems}</tbody>
            </table>
          </div>
        }
      </div>
    );
  }
}

ReportViewer.contextTypes = {
  browserHistory: PropTypes.object
};

ReportViewer = connect(state => ({
  auth: state.auth
}))(ReportViewer);
ReportViewer = translate()(ReportViewer);
export default ReportViewer;
