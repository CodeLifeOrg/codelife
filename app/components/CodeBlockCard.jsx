import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {Popover, PopoverInteractionKind, Position, Button, Dialog, Intent} from "@blueprintjs/core";

import CodeEditor from "components/CodeEditor/CodeEditor";
import ReportBox from "components/ReportBox";
import Loading from "components/Loading";
import "./CodeBlockCard.css";

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
      if (this.props.user && this.state.initialLikeState !== this.state.codeBlock.liked) {
        axios.post("/api/likes/save", {type: "codeblock", liked: this.state.codeBlock.liked, likeid: this.state.codeBlock.id}).then(resp => {
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

  handleReport() {
    const {codeBlock} = this.state;
    codeBlock.reported = true;
    this.forceUpdate();
  }

  render() {
    const {codeBlock, open} = this.state;

    if (!codeBlock) return <Loading />;

    const {t, userProgress, theme, icon, user} = this.props;
    const {id, lid, liked, reported, likes, snippetname, studentcontent, username} = codeBlock;

    const mine = this.props.user && codeBlock.uid === this.props.user.id;
    const displayname = mine ? t("you!") : false;

    const done = userProgress ? userProgress.find(p => p.level === lid && p.status === "completed") !== undefined : true;

    const embedLink = `${ location.origin }/codeBlocks/${ username }/${ snippetname }`;

    // define thumbnail image as null
    let thumbnailImg = null;

    // get corresponding thumbnail image
    if (username && snippetname) {
      if (username === "alice" && snippetname === "My Theme Park Island Snippet") {
        thumbnailImg = "concert-thumbnail@2x.jpg";
      }
      else if (username === "chloe" && snippetname === "O Suco Mais Gostoso!") {
        thumbnailImg = "bem-vindo-thumbnail@2x.jpg";
      }
      else if (username === "elio-soares" && snippetname === "Meu Ilha Gelada Desafio") {
        thumbnailImg = "iglu-da-lorena-thumbnail@2x.jpg";
      }
    }

    // define image path
    const thumbnailURL = `/thumbnails/codeblocks/${thumbnailImg}`;

    return (
      <div className="card-container">

        {/* cover button */}
        <button className="card-trigger u-absolute-expand u-unbutton u-margin-top-off u-margin-bottom-off" onClick={ this.toggleDialog.bind(this) }>
          <span className="u-visually-hidden">{ t("Project.View") }</span>
        </button>

        {/* card inner */}
        <div className={`codeblock-card ${theme}-card card`}>

          {/* show thumbnail image if one is found */}
          { thumbnailImg
            ? <div className="card-img" style={{backgroundImage: `url(${thumbnailURL})`}}>
              <span className="card-fullscreen-icon pt-icon pt-icon-fullscreen" />
            </div>
            : null }

          {/* caption */}
          <div className="card-caption codeblock-card-caption">

            {/* title */}
            <h4 className="card-title u-margin-top-off u-margin-bottom-off">{ snippetname }</h4>

            {/* author */}
            { username
              ? <span className="card-author font-xs">
                { t("Card.MadeBy") } <Link className="card-author-link link" to={`/profile/${username}`}>
                  { username }
                </Link>
              </span>
              : null }

            {/* likes */}
            <p className="card-likes font-xs u-margin-top-off">
              <button className={ `card-likes-button pt-icon-standard u-unbutton u-margin-top-off ${ liked ? "pt-icon-star" : "pt-icon-star-empty" } ${ likes ? "is-liked" : null }` } />
              <span className="card-likes-count">{ likes }</span>
              <span className="u-visually-hidden">&nbsp;
                { `${ likes } ${ likes === 1 ? t("Like") : t("Likes") }` }
              </span>
            </p>

            {/* island icon */}
            <span className="card-island-icon" />

            {/* datemodified ? <div className="card-author">{ t("Modified on") } { moment(datemodified).format("DD/MM/YY") }</div> : null */}
          </div>
        </div>

        {/* dialog */}
        <Dialog
          isOpen={ open }
          onClose={ this.toggleDialog.bind(this) }
          title={snippetname}
          lazy={false}
          inline={false}
          className={`${ theme } is-fullscreen` }
        >
          <div className="codeblock-inner pt-dialog-body">
            <CodeEditor initialValue={studentcontent} readOnly={true} blurred={!done} island={ theme } ref={c => this.editor = c} />
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-byline">
              { username ? `${t("Created by")} ${displayname || username}` : "" }
              <a href={ embedLink } target="_blank" className="share-link">{ embedLink }</a>
            </div>
            <div className="pt-dialog-footer-actions">
              { user
                ? <div>
                  <Popover
                    interactionKind={PopoverInteractionKind.CLICK}
                    popoverClassName="pt-popover-content-sizing"
                    position={Position.TOP_RIGHT}
                  >
                    <Button
                      intent={reported ? "" : Intent.DANGER}
                      iconName="flag"
                      text={reported ? "Flagged" : "Flag"}
                    />
                    <div>
                      <ReportBox reportid={id} contentType="codeblock" handleReport={this.handleReport.bind(this)}/>
                    </div>
                  </Popover>
                  <Button
                    intent={ liked ? Intent.WARNING : Intent.DEFAULT }
                    iconName={ `star${ liked ? "" : "-empty"}` }
                    onClick={ this.toggleLike.bind(this) }
                    text={ `${ likes } ${ likes === 1 ? t("Like") : t("Likes") }` }
                  />
                </div>
                : null
              }
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

CodeBlockCard = connect(state => ({
  user: state.auth.user
}))(CodeBlockCard);
CodeBlockCard = translate()(CodeBlockCard);
export default CodeBlockCard;
