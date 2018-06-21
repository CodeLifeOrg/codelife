import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {Link} from "react-router";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent, Popover, PopoverInteractionKind, Tooltip} from "@blueprintjs/core";
import ReportBox from "components/ReportBox";
import "./Comment.css";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import LoadingSpinner from "components/LoadingSpinner";

class Comment extends Component {

  constructor(props) {
    super(props);
    this.state = {
      comment: null
    };
  }

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

  handleReport(report) {
    const {comment} = this.state;
    comment.report = report;
    this.setState({comment});
  }

  render() {

    const {t: translate} = this.props;
    const {comment} = this.state;

    if (!comment) return <LoadingSpinner />;

    return (
      <span className="comment-thread thread">
        <span className="comment-thread-header thread-header">

          <span className="comment-thread-content thread-content">

            {/* post title */}
            <h4 className="comment-thread-title thread-title u-margin-bottom-off font-md">
              { comment.title }
            </h4>

            {/* meta */}
            <span className="comment-thread-user thread-user font-xs">
              { translate("by") } <Link className="link font-sm" to={ `/profile/${comment.user.username}`}>
                { comment.user.username }
                {/* role */}
                { comment.user.role !== 0 &&
                  <span className="comment-thread-user-role thread-user-role font-xs"> (
                    { comment.user.role === 1
                      ? translate("Contributor")
                      : comment.user.role === 2 &&
                        translate("Admin")
                    })
                  </span>
                }
              </Link>
              {/* date posted */}
              <span className="comment-thread-date thread-date">
                { `${translate("on")} ${this.formatDate(comment.date)}` }
              </span>
            </span>
          </span>

          <span className="comment-thread-actions thread-actions">
            <span className="like-comment">
              <Button
                intent={ comment.liked ? Intent.WARNING : Intent.DEFAULT}
                iconName={ `star${ comment.liked ? "" : "-empty"}` }
                onClick={ this.toggleLike.bind(this) }
                text={ `${ comment.likes } ${ comment.likes === 1 ? translate("Like") : translate("Likes") }` }
              />
            </span>
            <span className="report-comment" style={{textAlign: "right"}}>
              <Popover
                interactionKind={PopoverInteractionKind.CLICK}
                popoverClassName="pt-popover-content-sizing"
                position={Position.TOP_RIGHT}
                inline={true}
              >
                <Button
                  intent={comment.report ? Intent.DANGER : Intent.DEFAULT}
                  iconName="flag"
                  className={ `${comment.report ? "" : "pt-minimal"} pt-small` }
                />
                <ReportBox reportid={comment.id} permalink={this.props.permalink} contentType="comment" handleReport={this.handleReport.bind(this)} />
              </Popover>
            </span>
          </span>
        </span>

        {/* post content */}
        <span className="comment-thread-body thread-body" dangerouslySetInnerHTML={{__html: comment.content}} />
      </span>
    );
  }
}

Comment = connect(state => ({
  auth: state.auth,
  location: state.location
}))(Comment);
Comment = translate()(Comment);
export default Comment;
