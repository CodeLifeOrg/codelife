import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";

import CodeEditor from "components/CodeEditor";
import Loading from "components/Loading";
import "./CodeBlockCard.css";

import {ICONS} from "consts";

class CodeBlockCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      codeBlock: null,
      initialLikeState: false
    };
  }

  toggleDialog() {
    if (this.state.open) {
      if (this.state.initialLikeState !== this.state.codeBlock.liked) {
        axios.post("/api/likes/save", {liked: this.state.codeBlock.liked, likeid: this.state.codeBlock.id}).then(resp => {
          if (resp.status === 200) {
            console.log("success");
            if (this.props.reportLike) this.props.reportLike(this.state.codeBlock);
          }
          else {
            console.log("error");
          }
        });
      }
    }
    this.setState({open: !this.state.open});
  }

  toggleLike() {
    const {codeBlock} = this.state;
    if (codeBlock.liked) {
      codeBlock.liked = false;
      codeBlock.likes--;
    }
    else {
      codeBlock.liked = true;
      codeBlock.likes++;
    }
    this.setState({codeBlock});
  }

  componentDidMount() {
    const {codeBlock} = this.props;
    const initialLikeState = codeBlock.liked ? true : false;
    this.setState({initialLikeState, codeBlock});
  }

  componentDidUpdate() {
    if (this.state.codeBlock && this.props.codeBlock.id !== this.state.codeBlock.id) {
      const {codeBlock} = this.props;
      const initialLikeState = codeBlock.liked ? true : false;
      this.setState({initialLikeState, codeBlock});
    }
  }

  render() {
    const {codeBlock, open} = this.state;

    if (!codeBlock) return <Loading />;

    const {t, userProgress} = this.props;
    const {lid, liked, likes, mine, snippetname, studentcontent, username} = codeBlock;

    const done = userProgress ? userProgress.find(p => p.level === lid) !== undefined : true;

    return (
      <div className={ `codeBlockCard pt-card pt-elevation-0 pt-interactive ${lid}`}>
        <div className="box" onClick={ this.toggleDialog.bind(this) }>
          <div className="icon" style={{backgroundImage: `url("/islands/${lid}-small.png")`}}>
          </div>
          <div className="info">
            <div className="card-title">{ ICONS[lid] ? <span className={ `pt-icon-standard pt-icon-${ICONS[lid]}` } /> : null }{snippetname}</div>
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
          inline={false}
          className={ lid }
          style={{
            height: "80vh",
            maxHeight: "1000px",
            width: "90%"
          }}
        >
          <div className="pt-dialog-body">
            <CodeEditor initialValue={studentcontent} readOnly={true} blurred={!done} island={ lid } ref={c => this.editor = c} />
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
