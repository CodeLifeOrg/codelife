import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Collapse, Button, Toaster, Position, Intent, Popover, PopoverInteractionKind, Tooltip} from "@blueprintjs/core";
import Thread from "components/Thread";
import "./Discussion.css";
import QuillWrapper from "pages/admin/lessonbuilder/QuillWrapper";

import LoadingSpinner from "components/LoadingSpinner";

/** 
 * Discussion Board wraps a list of threads (which in turn hosts a list of comments). Discussion boards 
 * currently only apply to slides, but they are designed to be able to apply to anything (projects, codeblocks, etc)
 */

class Discussion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      threads: false,
      threadTitle: "",
      threadContent: "",
      commentFields: {},
      sortType: "date-oldest"
    };
  }

  componentDidMount() {
    // When Discussion is initalized, it already has props. This one-time call forces an initial update.
    this.componentDidUpdate({});
  }

  /**
   * When the user changes slides, hit the API endpoind and fetch the new thread data
   */ 
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


  /**
   * Prepare payload and post a new thread to the db
   */ 
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
        if (this.props.onNewThread) this.props.onNewThread(resp.data.newThread);
        this.setState({threads: resp.data.threads, threadTitle: "", threadContent: ""});
      }
    });
  }

  /**
   * On sort selection, sort the threads in state
   */ 
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
      case "likes-most":
        threads.sort((a, b) => a.likes < b.likes);
        break;
      case "likes-least":
        threads.sort((a, b) => a.likes >= b.likes);
        break;
      default:
        break;
    }
    this.setState({threads});
  }

  render() {

    const {t} = this.props;
    const {threads, threadTitle, threadContent} = this.state;

    if (!threads) return <LoadingSpinner label={false} />;

    return (
      <div className="discussion-container" id="Discussion">
        <div className="discussion-inner">
          <h2 className="discussion-heading">{ t("Discussion") }</h2>
          <div className="sort-bar font-xs field-container" id="sort-bar">
            <div className="pt-select">
              <label className="sort-bar-label" htmlFor="discussion-sort-by">{t("Sort By")}:</label>
              <select className="sort-bar-select" id="discussion-sort-by" value={this.state.sortBy} onChange={e => this.selectSort.bind(this)(e.target.value)}>
                <option value="date-oldest">Date: Oldest</option>
                <option value="date-newest">Date: Newest</option>
                <option value="comments-most">Comments: Most</option>
                <option value="comments-least">Comments: Least</option>
                <option value="likes-most">Likes: Most</option>
                <option value="likes-least">Likes: Least</option>
              </select>
            </div>
          </div>

          <div className="new-thread u-margin-bottom-lg">
            <span className="thread">
              <h3 className="new-thread-title">{t("Post New Thread")}</h3>
              <input className="pt-input" value={threadTitle} onChange={e => this.setState({threadTitle: e.target.value})} placeholder={t("Title")} />
              <QuillWrapper value={threadContent} onChange={tx => this.setState({threadContent: tx})} hideGlossary={true}/>
              <div className="post-button-container">
                <Button
                  className="post-button pt-intent-success pt-fill"
                  onClick={this.newThread.bind(this)}
                  disabled={!threadTitle || !threadContent || threadContent === "<p><br></p>"}
                >
                  {t("Start New Thread")}
                </Button>
              </div>
            </span>
          </div>

          <div className="threads" id="threads">
            { threads.map(t => <Thread key={t.id} thread={t} />) }
          </div>

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
