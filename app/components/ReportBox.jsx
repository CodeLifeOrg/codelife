import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Button, RadioGroup, Radio, Toaster, Position, Intent} from "@blueprintjs/core";
import "./ReportBox.css";

/**
 * ReportBox is a reusable component for reporting threads, comments, projects, and codeblocks for 
 * inappropriate content. As with many data structures in codelife, it uses a SINGLE reports table, 
 * with a "type" column that designates which table the report_id refers to.
 */

class ReportBox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      reason: "inappropriate-content",
      comment: "",
      previousReport: null,
      userProfile: null
    };
  }

  componentDidMount() {
    const {contentType, reportid} = this.props;
    let path;
    if (contentType === "codeblock") path = `/api/reports/byCodeBlockid?id=${reportid}`;
    if (contentType === "project") path = `/api/reports/byProjectid?id=${reportid}`;
    if (contentType === "thread") path = `/api/reports/byThreadid?id=${reportid}`;
    if (contentType === "comment") path = `/api/reports/byCommentid?id=${reportid}`;

    if (path) {
      let previousReport = null;
      const rget = axios.get(path);
      const uget = axios.get(`/api/profile/${this.props.auth.user.username}`);
      Promise.all([rget, uget]).then(resp => {

        const reports = resp[0].data;
        const userProfile = resp[1].data;

        if (reports[0] && reports[0].type === contentType && reports[0].report_id === reportid) previousReport = reports[0];
        const reason = previousReport ? previousReport.reason : this.state.reason;
        const comment = previousReport ? previousReport.comment : this.state.comment;
        this.setState({mounted: true, previousReport, reason, comment, userProfile});
      });
    }
  }

  handleChangeReason(e) {
    this.setState({reason: e.target.value});
  }

  handleChangeComment(e) {
    this.setState({comment: e.target.value});
  }

  banPage() {
    const {t, contentType} = this.props;
    let type;
    if (contentType === "codeblock") type = "codeBlocks";
    if (contentType === "project") type = "projects";
    if (contentType === "thread") type = "threads";
    if (contentType === "comment") type = "comments";
    if (type) {
      axios.post(`/api/${type}/setstatus`, {status: "banned", id: this.props.reportid}).then(resp => {
        if (resp.status === 200) {
          const toast = Toaster.create({className: "BanToast", position: Position.TOP_CENTER});
          toast.show({
            message: t("Content Banned"),
            intent: Intent.DANGER,
            action: {
              text: "Refresh",
              onClick: () => window.location.reload()
            }
          });
        }
        else {
          console.log("error");
        }
      });
    }
  }

  submitReport() {
    const {reason, comment} = this.state;
    const {reportid, contentType, permalink} = this.props;
    const rpayload = {reason, comment, permalink, type: contentType, report_id: reportid};
    const rpost = axios.post("/api/reports/save", rpayload);
    const upost = axios.post("/api/profile/decrement");

    Promise.all([rpost, upost]).then(resp => {
      if (resp.filter(r => r.status !== 200).length === 0) {
        const previousReport = resp[0].data;
        if (this.props.handleReport) this.props.handleReport(previousReport);
        this.setState({previousReport});
      }
      else {
        console.log("error");
      }
    });
  }

  render() {

    const {t} = this.props;
    const {previousReport, comment, userProfile} = this.state;

    const disabled = previousReport || !userProfile || userProfile.reports <= 0;
    const isAdmin = this.props.auth.user.role === 2;

    return (
      <div className="report-popover-inner u-text-left">

        {/* heading / alert */}
        <h2 className="report-heading font-md">
          { userProfile &&
            userProfile.reports > 0
            ? t("Flag Inappropriate Content")
            : t("Monthly Flag Limit Reached")
          }
        </h2>

        <div className={`report-popover-form${disabled ? " is-disabled" : ""}`}>

          {/* reason for flagging */}
          <div className="field-container font-sm">
            <RadioGroup
              label={previousReport ? t("reportReceive") : t("selectReason")}
              name="group"
              disabled={disabled}
              onChange={this.handleChangeReason.bind(this)}
              selectedValue={this.state.reason} >

              {/* options */}
              <Radio label={t("Inappropriate content")} value="inappropriate-content" />
              <Radio label={t("Bullying or abuse")} value="bullying-abuse" />
              <Radio label={t("Malicious content")} value="malicious-content" />
            </RadioGroup>
          </div>

          {/* additional comments */}
          <div className="field-container font-sm">
            <label htmlFor="report-comments">
              {t("Additional Comments")}
            </label>
            <textarea
              className="pt-input"
              value={comment}
              disabled={disabled}
              onChange={this.handleChangeComment.bind(this)} />
          </div>

          {/* submit / ban buttons */}
          <div className="field-container">
            <Button
              className="pt-button pt-intent-primary"
              disabled={disabled}
              key="submit"
              onClick={this.submitReport.bind(this)}>
              {t("Submit Report")}
            </Button>

            {isAdmin &&
              <Button
                className="pt-button pt-intent-danger"
                key="ban"
                onClick={this.banPage.bind(this)}>
                {t("Ban Content")}
              </Button>
            }
          </div>
        </div>
      </div>
    );
  }
}

ReportBox = connect(state => ({
  auth: state.auth
}))(ReportBox);
ReportBox = translate()(ReportBox);
export default ReportBox;
