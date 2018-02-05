import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent, Popover, PopoverInteractionKind, Tooltip} from "@blueprintjs/core";
import ReportBox from "components/ReportBox";
import "./Discussion.css";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import Loading from "components/Loading";

class Discussion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      threads: false,
      threadTitle: "",
      threadContent: "",
      reports: [],
      commentFields: {},
      sortType: "date-oldest"
    };
  }

  componentDidMount() {
    // When Discussion is initalized, it already has props. This one-time call forces an initial update.
    axios.get("/api/reports/discussions").then(resp => {
      const reports = resp.data;
      this.setState({reports}, this.componentDidUpdate({}));
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.subjectId !== this.props.subjectId) {
      const {subjectType, subjectId} = this.props;
      this.setState({threads: false});
      axios.get(`/api/threads/all?subject_type=${subjectType}&subject_id=${subjectId}`).then(resp => {
        const threads = resp.data;
        this.setState({threads});
      });
    }
  }

  toggleThread(id) {
    this.state[id] ? this.setState({[id]: undefined}) : this.setState({[id]: {title: "", content: ""}});
  }

  newComment(tid) {
    const {t} = this.props;
    const commentPost = {
      title: this.state[tid].title,
      content: this.state[tid].content,
      subject_type: this.props.subjectType,
      subject_id: this.props.subjectId,
      thread_id: tid
    };
    axios.post("/api/comments/new", commentPost).then(resp => {
      if (resp.status === 200) {
        const toast = Toaster.create({className: "newCommentToast", position: Position.TOP_CENTER});
        toast.show({message: t("Comment Posted!"), timeout: 1500, intent: Intent.SUCCESS});
        this.setState({threads: resp.data, [tid]: {title: "", content: ""}});
      }
    });
  }

  newThread() {
    const {t} = this.props;
    const threadPost = {
      title: this.state.threadTitle,
      content: this.state.threadContent,
      subject_type: this.props.subjectType,
      subject_id: this.props.subjectId
    };
    axios.post("/api/threads/new", threadPost).then(resp => {
      if (resp.status === 200) {
        const toast = Toaster.create({className: "newThreadToast", position: Position.TOP_CENTER});
        toast.show({message: t("Thread Posted!"), timeout: 1500, intent: Intent.SUCCESS});
        this.setState({threads: resp.data.threads, threadTitle: "", threadContent: ""});
      }
    });
  }

  selectSort(method) {
    const {threads} = this.state;
    switch (method) {
      case "date-oldest":
        threads.sort((a, b) => a.date > b.date ? 1 : -1);
        break;
      case "date-newest":
        threads.sort((a, b) => a.date <= b.date ? 1 : -1);
        break;
      case "comments-most":
        threads.sort((a, b) => a.commentlist.length < b.commentlist.length);
        break;
      case "comments-least":
        threads.sort((a, b) => a.commentlist.length >= b.commentlist.length);
        break;
      default:
        break;
    }
    this.setState({threads});
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
    const {threads, threadTitle, threadContent, reports} = this.state;

    if (!threads) return <Loading />;

    const threadItems = threads.map(t =>
      <div key={t.id} className="thread">
        <div className="thread-header">
          <div className="thread-content">
            <div className="thread-title">
              { t.title }
            </div>
            <div className="thread-user">
              { t.user.role === 1 ? <Tooltip content={ translate("Contributor") }><span className="pt-icon-standard pt-icon-book pt-intent-success"></span></Tooltip>
                : t.user.role === 2 ? <Tooltip content={ translate("Admin") }><span className="pt-icon-standard pt-icon-star pt-intent-warning"></span></Tooltip>
                  : null }
              { t.user.username }
              { /* `${t.userprofile.threads.length + t.userprofile.comments.length} posts` */ }
              <span className="thread-date">
                { translate("posted on") } { `${this.formatDate(t.date)}` }
              </span>
            </div>
            <div className="thread-body" dangerouslySetInnerHTML={{__html: t.content}} />
          </div>
          <div className="thread-actions">
            <div className="report-thread">
              <Popover
                interactionKind={PopoverInteractionKind.CLICK}
                popoverClassName="pt-popover-content-sizing"
                position={Position.TOP_RIGHT}
                inline={true}
              >
                <Button
                  intent={reports.find(r => r.type === "thread" && r.report_id === t.id) ? Intent.DANGER : Intent.DEFAULT}
                  iconName="flag"
                  className={ reports.find(r => r.type === "thread" && r.report_id === t.id) ? "" : "pt-minimal" }
                  text={reports.find(r => r.type === "thread" && r.report_id === t.id) ? "Flagged" : "Flag"}
                />
                <div style={{textAlign: "left"}}>
                  <ReportBox reportid={t.id} permalink={this.props.permalink} contentType="thread" handleReport={this.handleReport.bind(this)} />
                </div>
              </Popover>
            </div>
            <div className={ `show-comments pt-button ${ this.state[t.id] ? "pt-active" : "" }` } onClick={this.toggleThread.bind(this, t.id)}>
              <span>{ t.commentlist.length } { t.commentlist.length === 1 ? translate("Comment") : translate("Comments") }</span>
              <span className={`pt-icon-standard pt-icon-${this.state[t.id] ? "eye-off" : "comment"} pt-align-right`}></span>
            </div>
          </div>
        </div>

        <div className="comments">
          <Collapse isOpen={this.state[t.id]}>
            {
              t.commentlist.map(c =>
                <div key={c.id} className="comment">
                  <div className="comment-title">
                    { c.title }
                  </div>
                  <div className="comment-user">
                    { c.user.role === 1 ? <Tooltip content={ translate("Contributor") }><span className="pt-icon-standard pt-icon-book pt-intent-success"></span></Tooltip>
                      : c.user.role === 2 ? <Tooltip content={ translate("Admin") }><span className="pt-icon-standard pt-icon-star pt-intent-warning"></span></Tooltip>
                        : null }
                    { c.user.username }
                    { /* `${c.userprofile.threads.length + c.userprofile.comments.length} posts` */ }
                    <span className="comment-date">
                      { translate("posted on") } { `${this.formatDate(c.date)}` }
                    </span>
                  </div>
                  <div className="comment-body" dangerouslySetInnerHTML={{__html: c.content}} />
                  <div className="report-comment" style={{textAlign: "right"}}>
                    <Popover
                      interactionKind={PopoverInteractionKind.CLICK}
                      popoverClassName="pt-popover-content-sizing"
                      position={Position.TOP_RIGHT}
                      inline={true}
                    >
                      <Button
                        intent={reports.find(r => r.type === "comment" && r.report_id === c.id) ? Intent.DANGER : Intent.DEFAULT}
                        iconName="flag"
                        className={ `${reports.find(r => r.type === "comment" && r.report_id === c.id) ? "" : "pt-minimal"} pt-small` }
                      />
                      <ReportBox reportid={c.id} permalink={this.props.permalink} contentType="comment" handleReport={this.handleReport.bind(this)} />
                    </Popover>
                  </div>
                </div>
              )
            }
            {
              this.state[t.id]
                ? <div className="new-comment">
                  <div className="new-comment-title">{translate("Post New Comment")}</div>
                  <input className="pt-input" value={this.state[t.id].title} onChange={e => this.setState({[t.id]: {...this.state[t.id], title: e.target.value}})} placeholder={translate("Title")} />
                  <QuillWrapper hideGlossary={true} value={this.state[t.id].content} onChange={tx => this.setState({[t.id]: {...this.state[t.id], content: tx}})} />
                  <Button className="pt-intent-success post-button pt-fill" onClick={this.newComment.bind(this, t.id)}>{translate("Post Comment")}</Button>
                </div>
                : null
            }
          </Collapse>
        </div>

      </div>
    );

    return (
      <div id="Discussion">
        <h3>{ translate("Discussion") }</h3>
        <div id="sort-bar">
          Sort By
          <div className="pt-select">
            <select value={this.state.sortBy} onChange={e => this.selectSort.bind(this)(e.target.value)}>
              <option value="date-oldest">Date: Oldest</option>
              <option value="date-newest">Date: Newest</option>
              <option value="comments-most">Comments: Most</option>
              <option value="comments-least">Comments: Least</option>
            </select>
          </div>
        </div>
        <div id="threads">
          {threadItems}
        </div>
        <div className="new-thread">
          <div className="new-thread-title">{translate("Post New Thread")}</div>
          <input className="pt-input" value={threadTitle} onChange={e => this.setState({threadTitle: e.target.value})} placeholder={translate("Title")} />
          <QuillWrapper value={threadContent} onChange={tx => this.setState({threadContent: tx})} hideGlossary={true}/>
          <Button className="pt-intent-success post-button pt-fill" onClick={this.newThread.bind(this)}>{translate("Start New Thread")}</Button>
        </div>
      </div>
    );
  }
}

Discussion = connect(state => ({
  auth: state.auth,
  location: state.location
}))(Discussion);
Discussion = translate()(Discussion);
export default Discussion;
