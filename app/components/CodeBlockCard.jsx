import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";

import CodeEditor from "components/CodeEditor";
import "./CodeBlockCard.css";

class CodeBlockCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      liked: false,
      likes: 0
    };
  }

  toggleDialog() {
    if (this.state.open) {
      axios.post("/api/likes/save", {liked: this.state.liked, likeid: this.props.codeBlock.id}).then(resp => {
        if (resp.status === 200) {
          console.log("success");
          if (this.props.reportLike) this.props.reportLike();
        }
        else {
          console.log("error");
        }
      });
    }
    this.setState({open: !this.state.open});
  }

  toggleLike() {
    // TODO: can this be done better?  I'm storing likestate in two places, and this makes it possible
    // that they get out of sync. Revisit this later
    let {likes} = this.state;
    if (this.props.codeBlock.liked) {
      this.props.codeBlock.liked = false;
      likes--;
    }
    else {
      this.props.codeBlock.liked = true;
      likes++;
    }
    this.setState({liked: !this.state.liked, likes});
  }

  componentDidMount() {
    this.setState({liked: this.props.codeBlock.liked ? true : false, likes: this.props.codeBlock.likes});
  }



  render() {
    const {likes, open} = this.state;
    const {codeBlock, t, userProgress} = this.props;
    const {lid, liked, mine, snippetname, studentcontent, username} = codeBlock;

    const done = userProgress ? userProgress.find(p => p.level === lid) !== undefined : true;

    const inline = !this.props.breakout;
    const projectMode = this.props.projectMode;

    return (
      <div className={ `codeBlockCard pt-card pt-elevation-0 pt-interactive ${lid}`}>
        <div className="box" onClick={ this.toggleDialog.bind(this) }>
          <div className="icon" style={{backgroundImage: `url("/islands/${lid}-small.png")`}}>
          </div>
          <div className="info">
            <div className="card-title">{snippetname}</div>
            <div className="card-meta">
              { username ? <div className="card-author">
                { mine ? <span className="pt-icon-standard pt-icon-user pt-intent-primary"></span> : null }
                { `${t("Created by")} ${username}` }
              </div> : null }
              <div className="card-like"><span className={ `pt-icon-standard pt-icon-star${ liked ? " pt-intent-warning" : "-empty" }` }></span>{ `${ likes } ${ likes === 1 ? t("Like") : t("Likes") }` }</div>
            </div>
          </div>
        </div>
        <Dialog
          isOpen={ open }
          onClose={ this.toggleDialog.bind(this) }
          title={snippetname}
          lazy={false}
          inline={inline}
          className={ lid }
          style={{
            height: "75vh",
            maxHeight: "600px",
            maxWidth: "800px",
            width: "100%"
          }}
        >
          <div className="pt-dialog-body">
            <CodeEditor initialValue={studentcontent} preventSelection={!done} projectMode={projectMode} island={ lid } ref={c => this.editor = c} readOnly={true} />
            { done ? null
              : <div className={ `codeBlockTooltip pt-popover pt-tooltip ${ lid }` }>
                  <div className="pt-popover-content">
                    { t("Codeblock's code will be shown after you complete the last level of this island.") }
                  </div>
                </div> }
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-byline">{ username ? `${t("Created by")} ${username}` : "" }</div>
            <div className="pt-dialog-footer-actions">
              <Button
                intent={ liked ? Intent.WARNING : Intent.DEFAULT }
                iconName={ `star${ liked ? "" : "-empty"}` }
                onClick={ this.toggleLike.bind(this) }
                text={ `${ likes } ${ likes === 1 ? t("Like") : t("Likes") }` }
              />
              <Button
                intent={ Intent.PRIMARY }
                onClick={ this.toggleDialog.bind(this) }
                text={ t("Close") }
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

CodeBlockCard = translate()(CodeBlockCard);
export default CodeBlockCard;
