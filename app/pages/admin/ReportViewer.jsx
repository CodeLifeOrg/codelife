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
