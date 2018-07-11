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
import LoadingSpinner from "components/LoadingSpinner";
import "./CodeBlockCard.css";

/** 
 * CodeBlockCards appear throughout the site as a way of previewing a student's codeblock
 * It contains both the small clickable card with preview image AND the dialog box that pops
 * up over the page and shows the full screen code editor.
 */

class CodeBlockCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      codeBlock: null,
      forkName: ""
    };
  }

  toggleDialog() {
    this.setState({open: !this.state.open});
  }

  /**
   * Write the current like status of this codeblock to the db.
   * CodeBlockList must be informed when this happens so it can reorder the codeblocks
   * (liked codeblocks come first) so props.reportLike on return.
   */
  saveLikeStatus() {
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

  // Input handler for editing the name of the fork the user makes from this codeblock
  handleChange(e) {
    this.setState({forkName: e.target.value});
  }

  /**
   * Admin-only button callback that pings an API route to manually generate a screenshot
   * for this codeblock (usually only happens when codeblock owner saves file)
   */
  generateScreenshot() {
    axios.post("/api/codeBlocks/generateScreenshot", {id: this.props.codeBlock.id}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
    });
  }

  /**
   * When the forking sub-menu is opened, highlight and select the text for easy editing
   */
  selectFork() {
    this.forkInput.focus();
    this.forkInput.select();
  }

  /**
   * Admin-only button callback that sets a codeblock as featured or not (featured codeblocks
   * show up on the homepage)
   */
  toggleFeature() {
    const {codeBlock} = this.state;
    codeBlock.featured = !codeBlock.featured;
    axios.post("/api/codeBlocks/setfeatured", {id: codeBlock.id, featured: codeBlock.featured}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
      if (this.props.onToggleFeature) this.props.onToggleFeature();
    });
    this.forceUpdate();
  }

  /** 
   * Codeblocks can be forked into projects, so students may remix another student's work.
   * This function creates that new project and populates it with the codeblock data
   */
  toggleFork() {
    const {t} = this.props;
    // In Projects.jsx, pass down a prop that overtly blocks forking if the current
    // project they have open is unsaved.
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
          // In Projects.jsx, pass down a prop callback that can be called when the new 
          // fork is done writing. Call the callback with the id of the new project and the 
          // updated project list
          if (this.props.handleFork) {
            this.props.handleFork(newid, projects);
          }
          // If this codeblock isn't embedded in Projects.jsx, then nothing special need be done.
          // Because the project is written to the db, just send the user to the page to edit it.
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

  /**
   * Switch that functions a like on and off. Note that this is front-end only
   * and does not update the backend. 
   */
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

  /**
   * Toggles the like visually (toggleLike) and saves it to the db (saveLikeStatus)
   */
  directLike() {
    this.toggleLike.bind(this)();
    this.saveLikeStatus.bind(this)();
    this.forceUpdate();
  }

  /**
   * On mount, grab the codeblock from props and create a unique placeholder fork name via epoch time
   */
  componentDidMount() {
    const {codeBlock} = this.props;
    const forkName = codeBlock.snippetname.concat(Math.floor(new Date().getTime() / 100000));
    this.setState({codeBlock, forkName});
  }

  /**
   * On Update, if new props have been loaded in, load the new codeblock into state and update fork title
   */
  componentDidUpdate() {
    if (this.state.codeBlock && this.props.codeBlock.id !== this.state.codeBlock.id) {
      const {codeBlock} = this.props;
      const forkName = codeBlock.snippetname.concat(Math.floor(new Date().getTime() / 100000));
      this.setState({codeBlock, forkName});
    }
  }

  /**
   * This method is passed down as a callback to ReportBox. When reportBox signals a report,
   * it calls this function, which updates the embedded codeblock itself and forces a refresh
   */
  handleReport() {
    const {codeBlock} = this.state;
    codeBlock.reported = true;
    this.forceUpdate();
  }

  render() {
    const {codeBlock, open} = this.state;

    if (!codeBlock) return <LoadingSpinner />;

    const {t, userProgress, theme, user} = this.props;
    const {id, lid, liked, reported, likes, snippetname, slug, studentcontent, username, featured} = codeBlock;

    const mine = this.props.user && codeBlock.uid === this.props.user.id;
    const displayname = mine ? t("you!") : false;

    const done = userProgress ? userProgress.find(p => p.level === lid && p.status === "completed") !== undefined : true;

    const embedLink = `${ location.origin }/codeBlocks/${ username }/${ slug ? slug : snippetname }`;
    const userLink = `${ location.origin }/profile/${ username }`;

    // define thumbnail image as null
    let thumbnailImg = null;

    // These hard coded names are now deprecrated/unused
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

    thumbnailImg = true;
    // add v?=epoch to ensure a reload and use of an updated non-cached version
    const thumbnailURL = `/cb_images/${codeBlock.user.username}/${id}.png?v=${new Date().getTime()}`;

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
            ? <div className="card-img" style={{backgroundImage: `url("${thumbnailURL}")`}}>
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
                {t("Card.MadeBy")}&nbsp;
                { this.props.user
                  ? <Link className="card-author-link link" to={`/profile/${username}`}>
                    { username ? displayname || username : t("anonymous user") }
                  </Link>
                  : username ? displayname || username : t("anonymous user")
                }

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
                onClick={ this.directLike.bind(this) }
                aria-labelledby={`codeblock-card-${id}`} />
              <span className="card-likes-count">{ likes }</span>
              <span className="u-visually-hidden">&nbsp;
                { likes === 1 ? t("Like") : t("Likes") }
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
              {this.props.user
                ? <a href={userLink} className="card-dialog-link codeblock-dialog-link user-link">
                  { username ? displayname || username : t("anonymous user") }
                </a>
                : username ? displayname || username : t("anonymous user")
              }
              <a href={ embedLink } target="_blank" rel="noopener noreferrer" className="card-dialog-link codeblock-dialog-link share-link font-xs">{ embedLink }</a>
            </p>

            {/* show actions if logged in */}
            { user &&
              <div className="card-dialog-footer-actions codeblock-dialog-footer-actions pt-dialog-footer-actions">

                {/* likes */}
                <p className="card-dialog-footer-action codeblock-dialog-footer-action card-likes font-xs">
                  <button
                    className={ `card-likes-button pt-icon-standard u-unbutton ${ liked ? "pt-icon-star" : "pt-icon-star-empty" } ${ likes ? "is-liked" : null }` }
                    onClick={ this.directLike.bind(this) } />
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


                {/* show feature & screenshot buttons if user is admin */}
                { user.role === 2 &&
                  <div className="u-button-group">
                    <button
                      onClick={this.toggleFeature.bind(this)}
                      className={`card-feature-button pt-button pt-intent-primary font-xs${ featured ? " is-featured" : "" }`}>
                      { featured && <span className="pt-icon pt-icon-tick" /> }
                      <span className="u-hide-below-md">
                        { featured ? t("Featured") : t("Feature") }
                      </span>
                    </button>
                    <button
                      onClick={this.generateScreenshot.bind(this)}
                      className="card-screenshot-button pt-button pt-intent-primary font-xs">
                      <span className="pt-icon pt-icon-camera" />
                      <span className="u-hide-below-md">
                        {t("Screenshot")}
                      </span>
                    </button>
                  </div>
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
