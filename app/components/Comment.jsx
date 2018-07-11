import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent, Popover, PopoverInteractionKind, Tooltip} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/labs";
import ReportBox from "components/ReportBox";
import "./Comment.css";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import LoadingSpinner from "components/LoadingSpinner";

/**
 * Comments belong to Threads. Note that there is no text editor here - all posting is handled by Thread.jsx.
 * This component is for displaying only.
 */

class Comment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      comment: null
    };
  }

  /**
   * The comment itself is passed in via props. Put it in state
   */
  componentDidMount() {
    const {comment} = this.props;
    this.setState({comment});
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
   * Handle Liking and Unliking of comments
   */
  toggleLike() {
    const {comment} = this.state;
    const liked = !comment.liked;
    axios.post("/api/likes/save", {type: "comment", liked, likeid: comment.id}).then(resp => {
      if (resp.status === 200) {
        if (liked) {
          comment.likes++;
          comment.liked = true;
        }
        else {
          comment.likes--;
          comment.liked = false;
        }
        this.setState({comment});
      }
      else {
        console.log("error");
      }
    });
  }

  /**
   * When the nested ReportBox component processes a report, This commment module needs to update the button to 
   * reflect the new state. This callback handles that.
   */
  handleReport(report) {
    const {comment} = this.state;
    comment.report = report;
    this.setState({comment});
  }

  render() {

    const {context, t} = this.props;
    const {comment} = this.state;

    if (!comment) return <LoadingSpinner label="false" />;

    return (
      context !== "admin"
        ? <span className="comment-thread thread">
          <span className="comment-thread-header thread-header">

            <span className="comment-thread-content thread-content">

              {/* post title */}
              <h4 className="comment-thread-title thread-title u-margin-bottom-off font-md">
                { comment.title }
              </h4>

              {/* meta */}
              <span className="comment-thread-user thread-user font-xs">
                { t("by") } <Link className="link font-sm" to={ `/profile/${comment.user.username}`}>
                  { comment.user.username }
                  {/* role */}
                  { comment.user.role !== 0 &&
                    <span className="comment-thread-user-role thread-user-role font-xs"> (
                      { comment.user.role === 1
                        ? t("Contributor")
                        : comment.user.role === 2 &&
                          t("Admin")
                      })
                    </span>
                  }
                </Link>
                {/* date posted */}
                <span className="comment-thread-date thread-date">
                  { `${t("on")} ${this.formatDate(comment.date)}` }
                </span>
              </span>
            </span>

            <span className="thread-actions">

              {/* likes */}
              <p className="card-likes font-xs u-margin-top-off u-margin-bottom-off" id={`thread-${comment.id}`}>
                <button
                  className={ `card-likes-button pt-icon-standard u-unbutton u-margin-top-off ${ comment.liked ? "pt-icon-star" : "pt-icon-star-empty" } ${ comment.likes ? "is-liked" : null }` }
                  onClick={ this.toggleLike.bind(this) }
                  aria-labelledby={`thread-${comment.id}`} />
                <span className="card-likes-count">{ comment.likes }</span>
                <span className="u-visually-hidden">&nbsp;
                  { comment.likes === 1 ? t("Like") : t("Likes") }
                </span>
              </p>

              {/* flag content */}
              <Popover2
                className="card-dialog-flag-container"
                popoverClassName="pt-popover-content-sizing"
                interactionKind={PopoverInteractionKind.CLICK}
                placement="bottom-end" >

                {/* flag button */}
                <button className={`card-dialog-footer-action codeblock-dialog-footer-action flag-button ${comment.report && "is-flagged" } u-unbutton font-xs`}>
                  <span className="card-dialog-footer-action-icon codeblock-dialog-footer-action-icon flag-button-icon pt-icon pt-icon-flag" />
                  <span className="card-dialog-footer-action-text codeblock-dialog-footer-action-text">
                    {comment.report ? "Flagged" : "Flag"}
                  </span>
                </button>

                {/* flag form */}
                <ReportBox
                  reportid={comment.id}
                  contentType="thread"
                  handleReport={this.handleReport.bind(this)}
                  permalink={this.props.permalink}
                />
              </Popover2>
            </span>
          </span>

          {/* post content */}
          <span className="comment-thread-body thread-body" dangerouslySetInnerHTML={{__html: comment.content}} />
        </span>

        // appears in admin ReportViewer.jsx
        : <td className="thread">{/* post title */}

          <span className="thread-title u-margin-bottom-off">
            <span className="heading">{ comment.title }</span>
            {/* <span className="font-xs"> ({ comment.subject_id })</span> */}
          </span>

          {/* meta */}
          <span className="thread-user font-xs">
            { t("by") } <Link className="link" to={ `/profile/${comment.user.username}`}>
              { comment.user.username }
            </Link>
            {/* date posted */}
            <span className="thread-date">
              { ` ${t("on")} ${this.formatDate(comment.date)}` }
            </span>
          </span>

          {/* comment */}
          <span className="thread-comment font-sm" dangerouslySetInnerHTML={{__html: comment.content}} />

        </td>
    );
  }
}

Comment = connect(state => ({
  auth: state.auth,
  location: state.location
}))(Comment);
Comment = translate()(Comment);
export default Comment;
