import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent, PopoverInteractionKind} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/labs";
import ReportBox from "components/ReportBox";
import Comment from "components/Comment";
import "./Thread.css";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import LoadingSpinner from "components/LoadingSpinner";

/**
 * A thread is the top-level child of a Discussion. Discussions have many threads, threads have many comments.
 */

class Thread extends Component {

  constructor(props) {
    super(props);
    this.state = {
      thread: null,
      commentTitle: "",
      commentContent: "",
      showComments: false
    };
  }

  /**
   * On Mount, retrieve the thread from props
   */
  componentDidMount() {
    const {thread} = this.props;
    this.setState({thread});
  }

  toggleComments() {
    this.setState({showComments: !this.state.showComments});
  }

  toggleLike() {
    const {thread} = this.state;
    const liked = !thread.liked;
    axios.post("/api/likes/save", {type: "thread", liked, likeid: thread.id}).then(resp => {
      if (resp.status === 200) {
        if (liked) {
          thread.likes++;
          thread.liked = true;
        }
        else {
          thread.likes--;
          thread.liked = false;
        }
        this.setState({thread});
      }
      else {
        console.log("error");
      }
    });
  }

  /**
   * A thread can only have one text window open at a time for a new comment to be added. Keep the details of
   * this comment in state, and post it to the endpoint on submit
   */
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
    // const hours = `0${date.getHours()}`.slice(-2);
    // const minutes = `0${date.getMinutes()}`.slice(-2);
    // return `${day}/${month}/${year} - ${hours}:${minutes}`;
    return `${day}/${month}/${year}`;
  }

  /**
   * A report, handled by the sub-component ReportBox, uses this callback to tell Thread that the user has submitted a report
   */
  handleReport(report) {
    const {thread} = this.state;
    thread.report = report;
    this.setState({thread});
  }

  render() {

    const {context, t} = this.props;
    const {thread, commentTitle, commentContent} = this.state;

    if (!thread) return <LoadingSpinner />;

    const threadInvalid =
        !thread.title || !this.state.commentContent || this.state.commentContent === "<p><br></p>"
          ? true
          : false;

    return (
      context !== "admin"
        ? <span className="thread">
          <span className="thread-header">

            <span className="thread-content">

              {/* post title */}
              <h3 className="thread-title u-margin-bottom-off">
                { thread.title }
              </h3>

              {/* meta */}
              <span className="thread-user font-xs">
                { t("by") } <Link className="link font-sm" to={ `/profile/${thread.user.username}`}>
                  { thread.user.username }
                  {/* role */}
                  { thread.user.role !== 0 &&
                    <span className="thread-user-role font-xs"> (
                      { thread.user.role === 1
                        ? t("Contributor")
                        : thread.user.role === 2 &&
                          t("Admin")
                      })
                    </span>
                  }
                </Link>
                {/* date posted */}
                <span className="thread-date">
                  { `${t("on")} ${this.formatDate(thread.date)}` }
                </span>
              </span>
            </span>

            <span className="thread-actions">

              {/* likes */}
              <p className="card-likes font-xs u-margin-top-off u-margin-bottom-off" id={`thread-${thread.id}`}>
                <button
                  className={ `card-likes-button pt-icon-standard u-unbutton u-margin-top-off ${ thread.liked ? "pt-icon-star" : "pt-icon-star-empty" } ${ thread.likes ? "is-liked" : null }` }
                  onClick={ this.toggleLike.bind(this) }
                  aria-labelledby={`thread-${thread.id}`} />
                <span className="card-likes-count">{ thread.likes }</span>
                <span className="u-visually-hidden">&nbsp;
                  { thread.likes === 1 ? t("Like") : t("Likes") }
                </span>
              </p>

              {/* flag content */}
              <Popover2
                className="card-dialog-flag-container"
                popoverClassName="pt-popover-content-sizing"
                interactionKind={PopoverInteractionKind.CLICK}
                placement="bottom-end" >

                {/* flag button */}
                <button className={`card-dialog-footer-action codeblock-dialog-footer-action flag-button ${thread.report && "is-flagged" } u-unbutton font-xs`}>
                  <span className="card-dialog-footer-action-icon codeblock-dialog-footer-action-icon flag-button-icon pt-icon pt-icon-flag" />
                  <span className="card-dialog-footer-action-text codeblock-dialog-footer-action-text">
                    {thread.report ? "Flagged" : "Flag"}
                  </span>
                </button>

                {/* flag form */}
                <ReportBox
                  reportid={thread.id}
                  contentType="thread"
                  handleReport={this.handleReport.bind(this)}
                  permalink={this.props.permalink}
                />
              </Popover2>
            </span>
          </span>

          {/* post content */}
          <span className="thread-body" dangerouslySetInnerHTML={{__html: thread.content}} />


          {/* show / hide comments */}
          <button className="link u-unbutton font-sm u-margin-top-xs" onClick={this.toggleComments.bind(this)}>
            <span className="pt-icon pt-icon-chat" />
            { this.state.showComments
              // currently showing comments; hide them
              ? t("hide comments")
              // not currently showing comments; show them
              : thread.commentlist.length
                // we got comments; show comment count
                ? `${ t("show") } ${ thread.commentlist.length } ${ thread.commentlist.length === 1 ? t("comment") : t("comments") }`
                // no comments; prompt to add comment
                : t("add comment")
            }
          </button>

          {/* comments */}
          <span className="comments">
            <Collapse isOpen={this.state.showComments} component="span">
              { thread.commentlist.map(c => <Comment key={c.id} comment={c} />) }
              {
                this.state.showComments &&
                  <span className="new-comment">
                    <h3 className="new-comment-title u-margin-top-md">{t("Post New Comment")}</h3>
                    <label>
                      <span className="u-visually-hidden">{t("comment")} {t("Title")}</span>
                      <input className="pt-input" value={this.state.commentTitle} onChange={e => this.setState({commentTitle: e.target.value})} placeholder={t("Title")} />
                    </label>
                    <QuillWrapper hideGlossary={true} value={this.state.commentContent} onChange={tx => this.setState({commentContent: tx})} />
                    <Button
                      className={`post-button pt-button pt-fill${ threadInvalid ? "" : " pt-intent-success" }`}
                      onClick={this.newComment.bind(this)}
                      disabled={!commentTitle || !commentContent || commentContent === "<p><br></p>"}
                    >
                      {t("Post Comment")}
                    </Button>
                  </span>
              }
            </Collapse>
          </span>
        </span>

        // appears in admin ReportViewer.jsx
        : <td className="thread">{/* post title */}

          <span className="thread-title u-margin-bottom-off">
            <span className="heading">{ thread.title }</span>
            <span className="font-xs"> ({ thread.subject_id })</span>
          </span>

          {/* meta */}
          <span className="thread-user font-xs">
            { t("by") } <Link className="link" to={ `/profile/${thread.user.username}`}>
              { thread.user.username }
            </Link>
            {/* date posted */}
            <span className="thread-date">
              { ` ${t("on")} ${this.formatDate(thread.date)}` }
            </span>
          </span>

          {/* comment */}
          <span className="thread-comment font-sm" dangerouslySetInnerHTML={{__html: thread.content}} />

        </td>
    );
  }
}

Thread = connect(state => ({
  auth: state.auth,
  location: state.location
}))(Thread);
Thread = translate()(Thread);
export default Thread;
