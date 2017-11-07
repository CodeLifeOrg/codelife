import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import axios from "axios";
import ReportBox from "components/ReportBox";
import {Position, Popover, PopoverInteractionKind, Intent, Button} from "@blueprintjs/core";
import Constants from "utils/Constants.js";
import "./Share.css";

import Loading from "components/Loading";

class Share extends Component {

  constructor(props) {
    super(props);
    this.state = {
      content: null,
      user: null,
      reports: []
    };
  }

  renderPage() {
    if (this.refs.rc) {

      const hideContent = Number(this.state.content.reports >= Constants.FLAG_COUNT_BAN || this.state.content.status === "banned" || this.state.content.sharing === "false");
      const content = hideContent ? "This content has been disabled." : this.state.content.studentcontent;
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(content);
      doc.close();
      const {uid} = this.state.content;
      axios.get(`/api/user/${uid}/`).then(resp => {
        this.setState({user: resp.data});
      });
    }
  }

  componentDidMount() {
    const {username, filename} = this.props.params;
    let type = "";

    if (this.props.location.pathname.includes("/codeBlocks/")) type = "codeBlock";
    if (this.props.location.pathname.includes("/projects/")) type = "project";
    if (type === "codeBlock") {
      const cbget = axios.get(`/api/codeBlocks/byUsernameAndFilename?username=${username}&filename=${filename}`);
      const rget = axios.get("/api/reports");

      Promise.all([cbget, rget]).then(resp => {
        
        const content = resp[0].data[0];
        const reports = resp[1].data;

        this.setState({content, reports}, this.renderPage.bind(this));
      });
    }
    if (type === "project") {
      const pget = axios.get(`/api/projects/byUsernameAndFilename?username=${username}&filename=${filename}`);
      const rget = axios.get("/api/reports");
      Promise.all([pget, rget]).then(resp => {
        
        const content = resp[0].data[0];
        const reports = resp[1].data;
        console.log(content, reports);
        this.setState({content, reports}, this.renderPage.bind(this));
      });
    }
  }

  handleReport(report) {
    console.log(report);
    const {reports} = this.state;
    reports.push(report);
    this.setState({reports});
  }

  render() {
    const {content, reports, user} = this.state;

    if (!content) return <Loading />;

    const {t} = this.props;
    const {name, id} = content;

    let contentType = "";
    if (this.props.location.pathname.includes("/codeBlocks/")) contentType = "codeblock";
    if (this.props.location.pathname.includes("/projects/")) contentType = "project";

    const reported = reports.find(r => r.type === contentType && r.report_id === id); 

    return (
      <div id="share">
        <iframe id="iframe" ref="rc" />
        <div id="tag">
          <div className="info">
            <span className="pt-icon-standard pt-icon-code"></span>
            { name }{ user ? ` ${ t("by") } ` : "" }{ user ? <a className="user-link" href={ `/profile/${ user.username }` }>{ user.name || user.username }</a> : null }
          </div>
          <div className="logo">
            { t("Hosted by") } <a href="/"><img src="/logo/logo-sm.png" /></a>
          </div>
          { 
            content.status === "banned" || !this.props.auth.user
              ? null 
              : <Popover
                interactionKind={PopoverInteractionKind.CLICK}
                popoverClassName="pt-popover-content-sizing"
                position={Position.TOP_RIGHT}
                inline={true}
              >
                <Button
                  intent={reported ? "" : Intent.DANGER}
                  iconName="flag"
                  text={reported ? "Flagged" : "Flag"}
                />
                <div>
                  <ReportBox reportid={id} contentType={contentType} handleReport={this.handleReport.bind(this)}/>
                </div>
              </Popover>
          } 
        </div>
      </div>
    );
  }
}

Share = connect(state => ({
  auth: state.auth
}))(Share);
Share = translate()(Share);
export default Share;
