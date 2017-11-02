import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Button, RadioGroup, Radio, Toaster, Position, Intent} from "@blueprintjs/core";
import "./ReportBox.css";

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
    const path = contentType === "codeblock" ? `/api/reports/byCodeBlockid?id=${reportid}` : `/api/reports/byProjectid?id=${reportid}`;
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

  handleChangeReason(e) {
    this.setState({reason: e.target.value});
  }

  handleChangeComment(e) {
    this.setState({comment: e.target.value});
  }

  banPage() {
    const {t} = this.props;
    const type = this.props.contentType === "codeblock" ? "codeBlocks" : "projects";
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

  submitReport() {
    const {reason, comment, userProfile} = this.state;
    const {reportid, contentType} = this.props;
    const rpayload = {reason, comment, type: contentType, report_id: reportid};
    const rpost = axios.post("/api/reports/save", rpayload);
    const upayload = {reports: userProfile.reports - 1, uid: userProfile.uid};
    const upost = axios.post("/api/profile/update", upayload);

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
    const {mounted, previousReport, comment, userProfile} = this.state;

    const disabled = previousReport || !userProfile || userProfile.reports <= 0;
    const isAdmin = this.props.auth.user.role === 2;

    return (
      <div style={{color: "black"}}>
        <div>
          <div style={{fontSize: "16px", fontWeight: "bold", color: "red", marginBottom: "10px"}}>
            {
              userProfile 
                ? userProfile.reports > 0 
                  ? t("Flag Inappropriate Content") 
                  : t("Monthly Flag Limit Reached")
                : t("Loading")
            }
          </div>
          <RadioGroup
            label={previousReport ? t("Your report was received.") : t("Please select a reason below.")}
            name="group"
            disabled={disabled}
            onChange={this.handleChangeReason.bind(this)}
            selectedValue={this.state.reason}
          >
            <Radio label="Inappropriate Content" value="inappropriate-content" />
            <Radio label="Bullying or Abuse" value="bullying-abuse" />
            <Radio label="Malicious Content" value="malicious-content" /><br/>
          </RadioGroup>
          {t("Additional Comments")}
          <textarea className="pt-input" dir="auto" value={comment} disabled={disabled} onChange={this.handleChangeComment.bind(this)}></textarea><br/><br/>
          <Button style={{marginRight: "10px"}}className="pt-button pt-intent-success" disabled={disabled} key="submit" onClick={this.submitReport.bind(this)}>{t("Submit Report")}</Button>
          {isAdmin ? <Button className="pt-button pt-intent-danger" key="ban" onClick={this.banPage.bind(this)}>{t("Ban this Page")}</Button> : null }
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
