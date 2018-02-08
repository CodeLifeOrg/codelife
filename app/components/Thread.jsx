import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent, Popover, PopoverInteractionKind, Tooltip} from "@blueprintjs/core";
import ReportBox from "components/ReportBox";
import Comment from "components/Comment";
import "./Thread.css";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import Loading from "components/Loading";

class Thread extends Component {

  constructor(props) {
    super(props);
    this.state = {
      thread: null,
      reports: [],
      commentTitle: "",
      commentContent: "",
      showComments: false
    };
  }

  componentDidMount() {
    const {thread, reports} = this.props;
    this.setState({thread, reports});
  }

  toggleComments() {
    this.setState({showComments: !this.state.showComments});
  }

  newComment() {
    const {t} = this.props;
    const {thread, commentTitle, commentContent} = this.state;
    const commentPost = {
      title: commentTitle,
      content: commentContent,
      thread_id: thread.id
    };
    axios.post("/api/comments/new", commentPost).then(resp => {
      if (resp.status === 200) {
        const toast = Toaster.create({className: "newCommentToast", position: Position.TOP_CENTER});
        toast.show({message: t("Comment Posted!"), timeout: 1500, intent: Intent.SUCCESS});
        this.setState({thread: resp.data, commentTitle: "", commentContent: ""});
      }
    });
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
    const {thread, reports} = this.state;

    if (!thread) return <Loading />;    

    return (
      <div className="thread">
        <div className="thread-header">
          <div className="thread-content">
            <div className="thread-title">
              { thread.title }
            </div>
            <div className="thread-user">
              { thread.user.role === 1 ? <Tooltip content={ translate("Contributor") }><span className="pt-icon-standard pt-icon-book pt-intent-success"></span></Tooltip>
                : thread.user.role === 2 ? <Tooltip content={ translate("Admin") }><span className="pt-icon-standard pt-icon-star pt-intent-warning"></span></Tooltip>
                  : null }
              { thread.user.username }
              <span className="thread-date">
                { translate("posted on") } { `${this.formatDate(thread.date)}` }
              </span>
            </div>
            <div className="thread-body" dangerouslySetInnerHTML={{__html: thread.content}} />
          </div>
          <div className="thread-actions">
            <div className="report-thread">
              <Popover
                interactionKind={PopoverInteractionKind.CLICK}
                popoverClassName="pt-popover-content-sizing"
                position={Position.TOP_RIGHT}
                inline={true}
              >
                { /*
                <Button
                  intent={likes.find(l => l.type === "thread" && l.likeid === thread.id) ? Intent.DANGER : Intent.DEFAULT}
                  iconName="thumbsup"
                  className={ likes.find(l => l.type === "thread" && l.likeid === thread.id) ? "" : "pt-minimal" }
                  text={ likes.find(l => l.type === "thread" && l.likeid === thread.id) ? "Unlike" : "Flag"}
                />
                */ }
                <Button
                  intent={reports.find(r => r.type === "thread" && r.report_id === thread.id) ? Intent.DANGER : Intent.DEFAULT}
                  iconName="flag"
                  className={ reports.find(r => r.type === "thread" && r.report_id === thread.id) ? "" : "pt-minimal" }
                  text={reports.find(r => r.type === "thread" && r.report_id === thread.id) ? "Flagged" : "Flag"}
                />
                <div style={{textAlign: "left"}}>
                  <ReportBox reportid={thread.id} permalink={this.props.permalink} contentType="thread" handleReport={this.handleReport.bind(this)} />
                </div>
              </Popover>
            </div>
            <div className={ `show-comments pt-button ${ this.state.showComments ? "pt-active" : "" }` } onClick={this.toggleComments.bind(this)}>
              <span>{ thread.commentlist.length } { thread.commentlist.length === 1 ? translate("Comment") : translate("Comments") }</span>
              <span className={`pt-icon-standard pt-icon-${this.state.showComments ? "eye-off" : "comment"} pt-align-right`}></span>
            </div>
          </div>
        </div>
        <div className="comments">
          <Collapse isOpen={this.state.showComments}>
            { thread.commentlist.map(c => <Comment key={c.id} comment={c} reports={reports} />) }
            {
              this.state.showComments
                ? <div className="new-comment">
                  <div className="new-comment-title">{translate("Post New Comment")}</div>
                  <input className="pt-input" value={this.state.commentTitle} onChange={e => this.setState({commentTitle: e.target.value})} placeholder={translate("Title")} />
                  <QuillWrapper hideGlossary={true} value={this.state.commentContent} onChange={tx => this.setState({commentContent: tx})} />
                  <Button className="pt-intent-success post-button pt-fill" onClick={this.newComment.bind(this)}>{translate("Post Comment")}</Button>
                </div>
                : null
            }
          </Collapse>
        </div>
      </div>
    );
  }
}

Thread = connect(state => ({
  auth: state.auth,
  location: state.location
}))(Thread);
Thread = translate()(Thread);
export default Thread;
