import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";

class ReportViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      reports: []
    };
  }

  componentDidMount() {
    axios.get("/api/reports/all").then(resp => {
      const mounted = true;
      const reports = resp.data;
      console.log(reports);
      this.setState({mounted, reports});
    });
  }

  render() {

    const {reports} = this.state;

    if (!reports) return <Loading />;

    const projectReports = [];
    const codeblockReports = [];

    for (const r of reports) {
      r.codeblock_id ? codeblockReports.push(r) : projectReports.push(r);
    }

    const codeblockItems = codeblockReports.map(r => {
      return <li>{`${r.username}, ${r.reason}: ${r.comment}`}</li>
    });
    const projectItems = projectReports.map(r => {
      return <li>{`${r.username}, ${r.reason}: ${r.comment}`}</li>
    });


    return (
      <div>
        <div id="report-title" style={{fontSize: "24px", marginBottom: "10px"}}>Reports</div>
        <div className="cb-report-title" style={{fontSize: "14px"}}>Codeblocks</div>
        <div className="report-list">
          <ul>
          {codeblockItems}
          </ul>
        </div>
        <div className="cb-report-title" style={{fontSize: "14px"}}>Projects</div>
        <div className="report-list">
          <ul>
          {projectItems}
          </ul>
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
