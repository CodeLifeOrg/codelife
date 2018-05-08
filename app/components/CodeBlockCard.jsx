import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {PopoverInteractionKind, Dialog, Toaster, Position, Intent} from "@blueprintjs/core";
import {Popover2} from "@blueprintjs/labs";
import PropTypes from "prop-types";

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
      initialLikeState: false,
      forkName: ""
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

  handleChange(e) {
    this.setState({forkName: e.target.value});
  }

  selectFork() {
    this.forkInput.focus();
    this.forkInput.select();
  }

  toggleFeature() {
    const {codeBlock} = this.state;
    codeBlock.featured = !codeBlock.featured;
    axios.post("/api/codeBlocks/setfeatured", {id: codeBlock.id, featured: codeBlock.featured}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
    });
    this.forceUpdate();
  }

  toggleFork() {
    const {t} = this.props;
    if (this.props.blockFork) {
      const toast = Toaster.create({className: "shareToast", position: Position.TOP_CENTER});
      toast.show({message: t("Save your webpage before starting a new one!"), timeout: 1500, intent: Intent.WARNING});
    }
    else {
      const {browserHistory} = this.context;
      // Trim leading and trailing whitespace from the project title
      const name = this.state.forkName;
      const {studentcontent} = this.state.codeBlock;
      axios.post("/api/projects/new", {name, studentcontent}).then(resp => {
        if (resp.status === 200) {
          const projects = resp.data.projects;
          const newid = resp.data.id;
          const currentProject = projects.find(p => p.id === newid);
          this.setState({open: false});
          if (this.props.handleFork) {
            this.props.handleFork(newid, projects);
          }
          else {
            browserHistory.push(`/projects/${this.props.user.username}/${currentProject.name}/edit`);
          }
        }
        else {
          alert("Error");
        }
      });
    }
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
    const forkName = codeBlock.snippetname.concat(Math.floor(new Date().getTime() / 1000));
    this.setState({initialLikeState, codeBlock, forkName});
  }

  componentDidUpdate() {
    if (this.state.codeBlock && this.props.codeBlock.id !== this.state.codeBlock.id) {
      const {codeBlock} = this.props;
      const initialLikeState = codeBlock.liked ? true : false;
      const forkName = codeBlock.snippetname.concat(Math.floor(new Date().getTime() / 1000));
      this.setState({initialLikeState, codeBlock, forkName});
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
    const {id, lid, liked, reported, likes, snippetname, studentcontent, username, featured} = codeBlock;

    const mine = this.props.user && codeBlock.uid === this.props.user.id;
    const displayname = mine ? t("you!") : false;

    const done = userProgress ? userProgress.find(p => p.level === lid && p.status === "completed") !== undefined : true;

    const embedLink = `${ location.origin }/codeBlocks/${ username }/${ snippetname }`;
    const userLink = `${ location.origin }/profile/${ username }`;

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
    //const thumbnailURL = `/thumbnails/codeblocks/${thumbnailImg}`;
    thumbnailImg = true;
    const thumbnailURL = `/cb_images/${id}.png?v=${new Date().getTime()}`;



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
              <span className="card-action-icon pt-icon pt-icon-fullscreen" />
            </div>
            : null }

          {/* caption */}
          <div className="card-caption codeblock-card-caption">

            {/* title */}
            <h3 className="card-title font-sm u-margin-top-off u-margin-bottom-off">{ snippetname }</h3>

            {/* author */}
            { username
              ? <span className="card-author font-xs">
                { t("Card.MadeBy") } <Link className="card-author-link link" to={`/profile/${username}`}>
                  { username ? displayname || username : t("anonymous user") }
                </Link>

                {/* show edit link if it's yours */}
                {/* NOTE: codeblocks don't currently have a direct edit link though
                { displayname &&
                  <span className="edit-link-container">
                    &nbsp;(<Link className="edit-link link" to={`/island/${codeBlock.uid}`}>
                      {t("edit codeblock")}
                    </Link>)
                  </span>
                } */}
              </span>
              : null }

            {/* likes */}
            <p className="card-likes font-xs u-margin-top-off" id={`codeblock-card-${id}`}>
              <button
                className={ `card-likes-button pt-icon-standard u-unbutton u-margin-top-off ${ liked ? "pt-icon-star" : "pt-icon-star-empty" } ${ likes ? "is-liked" : null }` }
                onClick={ this.toggleLike.bind(this) }
                aria-labelledby={`codeblock-card-${id}`} />
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
          inline={true}
          className={`card-dialog codeblock-dialog ${ theme } is-fullscreen  u-padding-bottom-off` } >

          {/* main content */}
          <div className="card-dialog-inner codeblock-dialog-inner pt-dialog-body">
            <CodeEditor
              initialValue={studentcontent}
              readOnly={true}
              blurred={!done}
              island={ theme }
              ref={c => this.editor = c}
              noZoom={true} />
          </div>

          {/* footer */}
          <div className="card-dialog-footer codeblock-dialog-footer pt-dialog-footer u-margin-top-off-children u-margin-bottom-off-children">

            {/* created by */}
            <p className="card-dialog-footer-byline pt-dialog-footer-byline font-sm">
              {t("Created by")}&nbsp;
              <a href={userLink} className="card-dialog-link codeblock-dialog-link user-link">
                { username ? displayname || username : t("anonymous user") }
              </a>
              <a href={ embedLink } target="_blank" className="card-dialog-link codeblock-dialog-link share-link font-xs">{ embedLink }</a>
            </p>

            {/* show actions if logged in */}
            { user &&
              <div className="card-dialog-footer-actions codeblock-dialog-footer-actions pt-dialog-footer-actions">

                {/* show feature button if user is admin */}
                { user.role === 2 &&
                  <button 
                    onClick={this.toggleFeature.bind(this)}
                    className={`pt-button ${featured ? "pt-intent-success" : "pt-intent"}`}>
                    {featured ? "Featured" : "Feature"}
                  </button>
                }

                {/* likes */}
                <p className="card-dialog-footer-action codeblock-dialog-footer-action card-likes font-xs">
                  <button
                    className={ `card-likes-button pt-icon-standard u-unbutton ${ liked ? "pt-icon-star" : "pt-icon-star-empty" } ${ likes ? "is-liked" : null }` }
                    onClick={ this.toggleLike.bind(this) } />
                  <span className="card-dialog-footer-action-text card-likes-count codeblock-dialog-footer-action-text">{ likes }</span>
                  <span className="u-visually-hidden">&nbsp;
                    { `${ likes } ${ likes === 1 ? t("Like") : t("Likes") }` }
                  </span>
                </p>


                {/* flag content */}
                <Popover2
                  className="card-dialog-flag-container"
                  popoverClassName="pt-popover-content-sizing"
                  interactionKind={PopoverInteractionKind.CLICK}
                  placement="bottom-end" >

                  {/* flag button */}
                  <button className={`card-dialog-footer-action codeblock-dialog-footer-action flag-button ${reported && "is-flagged" } u-unbutton font-xs`}>
                    <span className="card-dialog-footer-action-icon codeblock-dialog-footer-action-icon flag-button-icon pt-icon pt-icon-flag" />
                    <span className="card-dialog-footer-action-text codeblock-dialog-footer-action-text">
                      {reported ? "Flagged" : "Flag"}
                    </span>
                  </button>

                  {/* flag form */}
                  <ReportBox
                    reportid={id}
                    contentType="codeblock"
                    handleReport={this.handleReport.bind(this)}
                  />
                </Popover2>


                {/* fork codeblock as project */}
                { done &&
                  <Popover2
                    interactionKind={PopoverInteractionKind.CLICK}
                    popoverClassName="fork-popover pt-popover-content-sizing"
                    placement="auto-end"
                    popoverDidOpen={this.selectFork.bind(this)}
                    key="fork-pop"
                    inline={false}>


                    {/* fork button */}
                    <button className="card-dialog-footer-action codeblock-dialog-footer-action fork-button u-unbutton link font-xs">
                      <span className="card-dialog-footer-action-icon codeblock-dialog-footer-action-icon fork-button-icon pt-icon pt-icon-fork" />
                      <span className="card-dialog-footer-action-text codeblock-dialog-footer-action-text">
                        {t("New Project from Codeblock")}
                      </span>
                    </button>

                    {/* fork popover */}
                    <div className="fork-popover-inner u-text-center" key="fork-div">
                      <div className="field-container">

                        {/* label */}
                        <label htmlFor="fork" className="heading font-md fork-heading">{t("New Project Name")}</label>

                        {/* input */}
                        <input
                          className="fork-input"
                          id="fork"
                          key="fork"
                          type="text"
                          ref={i => this.forkInput = i}
                          onChange={this.handleChange.bind(this)}
                          value={this.state.forkName}
                          autoFocus />
                      </div>

                      {/* submit button */}
                      <div className="field-container">
                        <button
                          className="fork-submit pt-button pt-intent-primary" onClick={this.toggleFork.bind(this)} >
                          {t("Create project")}
                        </button>
                      </div>
                    </div>
                  </Popover2>
                }
              </div>
            }
          </div>
        </Dialog>
      </div>
    );
  }
}

CodeBlockCard.contextTypes = {
  browserHistory: PropTypes.object
};

CodeBlockCard = connect(state => ({
  user: state.auth.user
}))(CodeBlockCard);
CodeBlockCard = translate()(CodeBlockCard);
export default CodeBlockCard;
