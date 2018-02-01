import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent, Popover, PopoverInteractionKind} from "@blueprintjs/core";
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
    console.log(report);
    const {reports} = this.state;
    reports.push(report);
    this.setState({reports});
  }

  render() {

    const {threads, threadTitle, threadContent, reports} = this.state;

    if (!threads) return <Loading />;

    const threadItems = threads.map(t =>
      <div key={t.id} className="thread">
        <div className="thread-title">
          { /* `${t.title} --- [${t.user.username} (${t.userprofile.threads.length + t.userprofile.comments.length} posts)]` */ }
          { `${t.title} --- [${t.user.username}] ${ t.user.role > 0 ? "(admin)" : ""}` }<br/>
          { `${this.formatDate(t.date)}` }
        </div>
        <div className="thread-body" dangerouslySetInnerHTML={{__html: t.content}} />
        <div className="view-comments" onClick={this.toggleThread.bind(this, t.id)}>
          {this.state[t.id] ? `Hide Comments (${t.commentlist.length})` : `Show Comments (${t.commentlist.length})`}
        </div>
        <div className="report-thread" style={{textAlign: "right"}}>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            popoverClassName="pt-popover-content-sizing"
            position={Position.TOP_RIGHT}
            inline={true}
          >
            <Button
              intent={reports.find(r => r.type === "thread" && r.report_id === t.id) ? "" : Intent.DANGER}
              iconName="flag"
              text={reports.find(r => r.type === "thread" && r.report_id === t.id) ? "Flagged" : "Flag"}
            />
            <div style={{textAlign: "left"}}>
              <ReportBox reportid={t.id} contentType="thread" handleReport={this.handleReport.bind(this)} />
            </div>
          </Popover>  
        </div>
        <div className="comments">
          <Collapse isOpen={this.state[t.id]}>
            {
              t.commentlist.map(c => 
                <div key={c.id} className="comment">
                  <div className="comment-title">
                    { `${c.title} --- [${c.user.username}] ${ t.user.role > 0 ? "(admin)" : ""}` }<br/>
                    { `${this.formatDate(c.date)}` }
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
                        intent={reports.find(r => r.type === "comment" && r.report_id === c.id) ? "" : Intent.DANGER}
                        iconName="flag"
                        text={reports.find(r => r.type === "comment" && r.report_id === c.id) ? "Flagged" : "Flag"}
                      />
                      <div style={{textAlign: "left"}}>
                        <ReportBox reportid={c.id} contentType="comment" handleReport={this.handleReport.bind(this)} />
                      </div>
                    </Popover>  
                  </div>
                </div>
              )
            }
            { 
              this.state[t.id] 
                ? <div className="new-comment">
                  <strong>Post New Comment</strong><br/><br/>
                  Comment Title:
                  <input className="new-comment-title" value={this.state[t.id].title} onChange={e => this.setState({[t.id]: {...this.state[t.id], title: e.target.value}})} />
                  <QuillWrapper hideGlossary={true} value={this.state[t.id].content} onChange={tx => this.setState({[t.id]: {...this.state[t.id], content: tx}})} />
                  <Button className="pt-intent-success post-button" onClick={this.newComment.bind(this, t.id)}>Post Comment</Button>
                </div>
                : null
            }
          </Collapse>
        </div>
      </div>
    );

    return (
      <div id="discussion">
        <div id="sort-bar" style={{textAlign: "right"}}>
          Sort By 
          <div className="pt-select" style={{marginLeft: "10px"}}>
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
          Thead Title: 
          <input className="new-thread-title" value={threadTitle} onChange={e => this.setState({threadTitle: e.target.value})} />
          <QuillWrapper value={threadContent} onChange={tx => this.setState({threadContent: tx})} hideGlossary={true}/>
          <Button className="pt-intent-success post-button" onClick={this.newThread.bind(this)}>Start New Thread</Button>
        </div>
      </div>
    );
  }
}

Discussion = connect(state => ({
  auth: state.auth
}))(Discussion);
Discussion = translate()(Discussion);
export default Discussion;
