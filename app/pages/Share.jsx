import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import axios from "axios";
import ReportBox from "components/ReportBox";
import CodeEditor from "components/CodeEditor/CodeEditor";
import {Position, Popover, PopoverInteractionKind, Intent, Button} from "@blueprintjs/core";
import "./Share.css";

import Loading from "components/Loading";

class Share extends Component {

  constructor(props) {
    super(props);
    this.state = {
      content: null,
      user: null,
      reports: [],
      constants: null
    };
  }

  getUser() {
    const {uid} = this.state.content;
    axios.get(`/api/profile/share/${uid}/`).then(resp => {
      this.setState({user: resp.data});
    });
  }

  componentDidMount() {
    const {username, filename} = this.props.params;
    let path = "";

    if (this.props.location.pathname.includes("/codeBlocks/")) path = "codeBlocks";
    if (this.props.location.pathname.includes("/projects/")) path = "projects";

    const cget = axios.get(`/api/${path}/byUsernameAndFilename?username=${username}&filename=${filename}`);
    const rget = axios.get("/api/reports");
    const scget = axios.get("/api/siteconfigs");

    Promise.all([cget, rget, scget]).then(resp => {

      const content = resp[0].data[0];
      const reports = resp[1].data;
      const constants = resp[2].data;

      this.setState({content, reports, constants}, this.getUser.bind(this));
    });
  }

  handleReport(report) {
    const {reports} = this.state;
    reports.push(report);
    this.setState({reports});
  }

  render() {
    const {content, reports, user} = this.state;

    if (!content) return <Loading dark={true} />;

    const {t} = this.props;
    const {id} = content;
    const name = content.name || content.snippetname;

    let contentType = "";
    if (this.props.location.pathname.includes("/codeBlocks/")) contentType = "codeblock";
    if (this.props.location.pathname.includes("/projects/")) contentType = "project";

    const reported = reports.find(r => r.type === contentType && r.report_id === id);

    return (
      <div id="share">
        <CodeEditor initialValue={this.state.content.studentcontent} readOnly={true} showEditor={false} ref={c => this.editor = c} tabs={false} console={false} />
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
              : <div className="actions">
                <Popover
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
              </div>
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
