import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {browserHistory} from "react-router";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent} from "@blueprintjs/core";
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
      commentFields: {}
    };
  }

  componentDidMount() {
    // When Discussion is initalized, it already has props. This one-time call forces an initial update.
    this.componentDidUpdate({});
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

  render() {

    const {threads, threadTitle, threadContent} = this.state;

    if (!threads) return <Loading />;

    console.log(threads);

    const threadItems = threads.map(t =>
      <div key={t.id} className="thread">
        <div className="thread-title">
          { /* `${t.title} --- [${t.user.username} (${t.userprofile.threads.length + t.userprofile.comments.length} posts)]` */ }
          { `${t.title} --- [${t.user.username}] ${ t.user.role > 1 ? "(admin)" : ""}` }
        </div>
        <div className="thread-body" dangerouslySetInnerHTML={{__html: t.content}} />
        <div className="view-comments" onClick={this.toggleThread.bind(this, t.id)}>
          {this.state[t.id] ? "Hide Comments" : "Show Comments"}
        </div>
        <div className="comments">
          <Collapse isOpen={this.state[t.id]}>
            {
              t.commentlist.map(c => 
                <div key={c.id} className="comment">
                  <div className="comment-title">
                    { `${c.title} --- [${c.user.username}] ${ t.user.role > 1 ? "(admin)" : ""}` }
                  </div>
                  <div className="comment-body" dangerouslySetInnerHTML={{__html: c.content}} />
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
