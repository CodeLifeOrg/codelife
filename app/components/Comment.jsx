import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent, Popover, PopoverInteractionKind, Tooltip} from "@blueprintjs/core";
import ReportBox from "components/ReportBox";
import "./Comment.css";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import Loading from "components/Loading";

class Comment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      comment: null,
      reports: []
    };
  }

  componentDidMount() {
    const {comment, reports} = this.props;
    this.setState({comment, reports});
  }

  formatDate(datestring) {
    const date = new Date(datestring);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  }

  handleReport(report) {
    const {reports} = this.state;
    reports.push(report);
    this.setState({reports});
  }

  render() {

    const {t: translate} = this.props;
    const {comment, reports} = this.state;

    if (!comment) return <Loading />;    

    return (
      <div className="comment">
        <div className="comment-title">
          { comment.title }
        </div>
        <div className="comment-user">
          { comment.user.role === 1 ? <Tooltip content={ translate("Contributor") }><span className="pt-icon-standard pt-icon-book pt-intent-success"></span></Tooltip>
            : comment.user.role === 2 ? <Tooltip content={ translate("Admin") }><span className="pt-icon-standard pt-icon-star pt-intent-warning"></span></Tooltip>
              : null }
          { comment.user.username }
          <span className="comment-date">
            { translate("posted on") } { `${this.formatDate(comment.date)}` }
          </span>
        </div>
        <div className="comment-body" dangerouslySetInnerHTML={{__html: comment.content}} />
        <div className="report-comment" style={{textAlign: "right"}}>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            popoverClassName="pt-popover-content-sizing"
            position={Position.TOP_RIGHT}
            inline={true}
          >
            <Button
              intent={reports.find(r => r.type === "comment" && r.report_id === comment.id) ? Intent.DANGER : Intent.DEFAULT}
              iconName="flag"
              className={ `${reports.find(r => r.type === "comment" && r.report_id === comment.id) ? "" : "pt-minimal"} pt-small` }
            />
            <ReportBox reportid={comment.id} permalink={this.props.permalink} contentType="comment" handleReport={this.handleReport.bind(this)} />
          </Popover>
        </div>
      </div>
    
    );
  }
}

Comment = connect(state => ({
  auth: state.auth,
  location: state.location
}))(Comment);
Comment = translate()(Comment);
export default Comment;
