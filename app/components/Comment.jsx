import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
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
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
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
        <div className="like-thread">
          <Button
            intent={ comment.liked ? Intent.WARNING : Intent.DEFAULT}
            iconName={ `star${ comment.liked ? "" : "-empty"}` }
            onClick={ this.toggleLike.bind(this) }
            text={ `${ comment.likes } ${ comment.likes === 1 ? translate("Like") : translate("Likes") }` }
          />
        </div>
        <div className="report-comment" style={{textAlign: "right"}}>
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
