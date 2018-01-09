import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {browserHistory} from "react-router";
import {translate} from "react-i18next";
import {Collapse, Button} from "@blueprintjs/core";
import "./Discussion.css";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import Loading from "components/Loading";

class Discussion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      threads: [],
      threadTitle: "",
      threadContent: ""
    };
  }

  componentDidMount() {
    const mounted = true;
    const db_threads = [{
      id: 1,
      title: "why do i have to use brackets",
      content: "what's the deal?"
    },
    {
      id: 2,
      title: "there's a typo in the question",
      content: "you spelled antidisestablishmentarianism wrong"
    },
    {
      id: 3,
      title: "i'm stuck, can someone help?",
      content: "how do i make a tag"
    }];
    const db_comments = [{
      id: 1,
      title: "because that's html!",
      content: "this is why you should use [insert framework here].",
      thread_id: 1
    },
    {
      id: 2,
      title: "i don't know either",
      content: "can someone help?",
      thread_id: 1
    },
    {
      id: 3,
      title: "thanks!",
      content: "this was helpful",
      thread_id: 2
    }];
    const threads = db_threads.map(t => {
      return {...t, comments: db_comments.filter(c => c.thread_id === t.id)}
    });
    console.log(threads);
    this.setState({mounted, threads});
  }

  toggleThread(id) {
    this.setState({[id]: !this.state[id]});
  }

  newComment(thread_id) {
    /*const thread = this.threads.find(t => t.id === thread_id);
    if (thread) {
      thread.comments.push({
        id: new Date().getTime(),
        title: 
      })
    }*/

  }

  newThread() {
    const threads = this.state.threads.concat({
      id: new Date().getTime(),
      title: this.state.threadTitle,
      content: this.state.threadContent,
      comments: []
    });
    const threadTitle = "";
    const threadContent = "";
    this.setState({threads, threadTitle, threadContent});
  }

  render() {

    const {mounted, threads, threadTitle, threadContent} = this.state;

    if (!mounted) return <Loading />;

    const threadItems = threads.map(t => {
      return <div className="thread">
        <div className="thread-title">
          {t.title}
        </div>
        <div className="thread-body">
          {t.content}
        </div>
        <div className="view-comments" onClick={this.toggleThread.bind(this, t.id)}>
          {this.state[t.id] ? "Hide Comments" : "Show Comments"}
        </div>
        <div className="comments">
          <Collapse isOpen={this.state[t.id]}>
            {
              t.comments.map(c => {
                return <div className="comment">
                  <div className="comment-title">
                    {c.title}
                  </div>
                  <div className="comment-body">
                    {c.content} 
                  </div>
                </div>
              })
            }
            <div className="new-comment">
              <QuillWrapper hideGlossary={true}/>
              <Button className="pt-intent-success post-button" onClick={this.newComment.bind(this, t.id)}>Post Comment</Button>
            </div>
          </Collapse>
        </div>
      </div>
    });

    return (
      <div id="discussion">
        <div id="threads">
          {threadItems}
        </div>
        <div className="new-thread">
          Thead Title: 
          <input className="new-thread-title" value={threadTitle} onChange={e => this.setState({threadTitle: e.target.value})} />
          <QuillWrapper value={threadContent} onChange={t => this.setState({threadContent: t})}hideGlossary={true}/>
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