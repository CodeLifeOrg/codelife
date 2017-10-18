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

    /* Due to a limitation of blueprint's popover library, if you change the content of a Popover
    after it is opened, it maintains its anchor point.  Therefore, for the split second that we return "Loading"
    we create a tiny window, then when the DB populates, the Popover fills in off the screen using the original 
    smaller loading point.  To get around that, we fill the popover here with dummy data when not mounted, 
    just to get the size right.
    TODO: Find a better way to do this.  
      - Blueprint may provide a better positioning switch for this
      - Get the data outside of this reportBox so it needn't hit the DB on click
    */
    if (!mounted) {
      return <div>
        <div style={{fontSize: "16px", fontWeight: "bold", color: "red", marginBottom: "10px"}}>Loading...</div>
        <RadioGroup
          label={t("Loading History...")}
          name="group"
          disabled={true}
          selectedValue={this.state.reason}
        >
          <Radio label="Inappropriate Content" value="inappropriate-content" />
          <Radio label="Bullying or Abuse" value="bullying-abuse" />
          <Radio label="Malicious Content" value="malicious-content" /><br/>
        </RadioGroup>
        {t("Additional Comments")}
        <textarea className="pt-input" dir="auto" value={comment} disabled={true}></textarea><br/><br/>
        <Button className="pt-button pt-intent-warning" key="submit" >{t("Loading...")}</Button>
      </div>;
    }

    return (
      <div style={{color: "black"}}>
        { 
          this.props.auth.user.role <= 1 
            ? userProfile.reports > 0 
              ? <div>
                <div style={{fontSize: "16px", fontWeight: "bold", color: "red", marginBottom: "10px"}}>Flag Inappropriate Content</div>
                <RadioGroup
                  label={previousReport ? t("Your report was received.") : t("Please select a reason below.")}
                  name="group"
                  disabled={previousReport}
                  onChange={this.handleChangeReason.bind(this)}
                  selectedValue={this.state.reason}
                >
                  <Radio label="Inappropriate Content" value="inappropriate-content" />
                  <Radio label="Bullying or Abuse" value="bullying-abuse" />
                  <Radio label="Malicious Content" value="malicious-content" /><br/>
                </RadioGroup>
                {t("Additional Comments")}
                <textarea className="pt-input" dir="auto" value={comment} disabled={previousReport} onChange={this.handleChangeComment.bind(this)}></textarea><br/><br/>
                {!previousReport ? <Button className="pt-button pt-intent-success" key="submit" onClick={this.submitReport.bind(this)}>{t("Submit Report")}</Button> : null } 
              </div>
              : <div>
                { t("You have reached your flag limit for this month.") }
              </div>
            : <div>
              <Button className="pt-button pt-intent-danger" key="ban" onClick={this.banPage.bind(this)}>{t("Ban this Page")}</Button>
            </div>       
        }
      </div>
    );
  }
}

ReportBox = connect(state => ({
  auth: state.auth
}))(ReportBox);
ReportBox = translate()(ReportBox);
export default ReportBox;
