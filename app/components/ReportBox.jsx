import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Button, RadioGroup, Radio} from "@blueprintjs/core";
import "./ReportBox.css";

class ReportBox extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      reason: "inappropriate-content",
      comment: "",
      previousReport: null
    };
  }

  componentDidMount() {
    const {contentType, reportid} = this.props;
    const path = contentType === "codeblock" ? `/api/reports/byCodeBlockid?id=${reportid}` : `/api/reports/byProjectid?id=${reportid}`;
    let previousReport = null;
    axios.get(path).then(resp => {
      if (resp.data[0] && resp.data[0].type === contentType && resp.data[0].report_id === reportid) previousReport = resp.data[0];
      const reason = previousReport ? previousReport.reason : this.state.reason;
      const comment = previousReport ? previousReport.comment : this.state.comment;
      this.setState({mounted: true, previousReport, reason, comment});
    });
  }

  handleChangeReason(e) {
    this.setState({reason: e.target.value});
  }

  handleChangeComment(e) {
    this.setState({comment: e.target.value});
  }

  submitReport() {
    const {reason, comment} = this.state;
    const {reportid, contentType} = this.props;
    const payload = {reason, comment, type: contentType, report_id: reportid};
    axios.post("/api/reports/save", payload).then(resp => {
      if (resp.status === 200) {
        this.setState({previousReport: resp.data});
      } 
      else {
        console.log("error");
      }
    });
  }

  render() {

    const {t} = this.props;
    const {mounted, previousReport, comment} = this.state;

    return (
      <div>
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
    );
  }
}

ReportBox = connect(state => ({
  auth: state.auth
}))(ReportBox);
ReportBox = translate()(ReportBox);
export default ReportBox;
