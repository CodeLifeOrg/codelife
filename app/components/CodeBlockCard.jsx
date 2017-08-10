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
        resp.status === 200 ? console.log("success") : console.log("error");
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
    const {open} = this.state;
    const {codeBlock, t, userProgress} = this.props;
    const {lid, liked, likes, mine, snippetname, studentcontent, username} = codeBlock;

    const done = userProgress ? userProgress.find(p => p.level === lid) !== undefined : true;

    const inline = !this.props.breakout;
    const projectMode = this.props.projectMode;

    return (
      <div className={ `codeBlockCard pt-card pt-elevation-0 pt-interactive ${lid}`} style={{boxShadow: codeBlock.featured ? "0px 0px 5px 5px rgba(255, 255, 120, .5)" : ""}}>
        <div className="box" onClick={ this.toggleDialog.bind(this) }>
          <div className="icon" style={{backgroundImage: `url("/islands/${lid}-small.png")`}}></div>
          <div className="info">
            <div className="card-title">
              {snippetname}
              {mine ? <span style={{color: "lightgreen", marginLeft: "5px"}} className="pt-icon-standard pt-icon-user"></span> : null}
              { /* codeBlock.featured ? <span style={{color: "yellow", marginLeft: "5px"}} className="pt-icon-standard pt-icon-star"></span> : null */ }
              {liked ? <span style={{color: "pink", marginLeft: "5px"}} className="pt-icon-standard pt-icon-star"></span> : null }
            </div>
            { username ? <div className="card-author">{ `${t("Created by")} ${username}` }</div> : null }
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
                text={ `${ t("Favorite") } (${ this.state.likes })` }
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
