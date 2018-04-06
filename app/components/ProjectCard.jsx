import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {Popover, PopoverInteractionKind, Intent, Position, Button, Dialog} from "@blueprintjs/core";
import "moment/locale/pt-br";
import moment from "moment";
import ReportBox from "components/ReportBox";
import CodeEditor from "components/CodeEditor/CodeEditor";

import "components/ProjectCard.css";

class ProjectCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      initialLikeState: "false",
      likes: 0
    };
  }

  toggleDialog() {
    this.setState({open: !this.state.open});
  }

  handleReport(report) {
    const {project} = this.props;
    project.reported = true;
    this.forceUpdate();
  }

  render() {
    const {open} = this.state;
    const {location, project, t, user} = this.props;
    const {datemodified, id, likes, liked, name, studentcontent, username, reported} = project;

    moment.locale("pt-BR");

    const embedLink = `${ location.origin }/projects/${ username }/${ project.name }`;

    // define thumbnail image as null
    let thumbnailImg = null;

    // get corresponding thumbnail image
    if (username && name) {
      if (username === "Guilherme Oliveira" && name === "mypage.html") {
        thumbnailImg = "culinaria-brasileira-thumbnail@2x.jpg";
      }
      else if (username === "Richard Garcia" && name === "Site Gamer") {
        thumbnailImg = "top-10-jogos-thumbnail@2x.jpg";
      }
      else if (username === "ana-caroline" && name === "mypage.html") {
        thumbnailImg = "herois-thumbnail@2x.jpg";
      }
    }

    // define image path
    const thumbnailURL = `/thumbnails/projects/${thumbnailImg}`;

    return (
      <div className="card-container" key={id}>

        {/* cover button */}
        <button className="card-trigger u-absolute-expand u-unbutton u-margin-top-off u-margin-bottom-off" onClick={ this.toggleDialog.bind(this) }>
          <span className="u-visually-hidden">{ t("Project.View") }</span>
        </button>

        {/* card inner */}
        <div className="project-card card">

          {/* show thumbnail image if one is found */}
          { thumbnailImg
            ? <div className="card-img" style={{backgroundImage: `url(${thumbnailURL})`}}>
              <span className="card-fullscreen-icon pt-icon pt-icon-fullscreen" />
            </div>
            : null }

          {/* caption */}
          <div className="card-caption">

            {/* title */}
            <h4 className="card-title u-margin-top-off u-margin-bottom-off">
              { name !== "mypage.html" ? name : t("Card.NewProject") }
            </h4>

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
              <button className={ `card-likes-button pt-icon-standard u-unbutton u-margin-top-off ${ liked ? "pt-icon-star" : "pt-icon-star-empty" }` } />
              <span className="card-likes-count">0</span>
              <span className="u-visually-hidden">&nbsp;
                { `${ likes } ${ likes === 1 ? t("Like") : t("Likes") }` }
              </span>
            </p>

            {/* datemodified ? <div className="card-author">{ t("Modified on") } { moment(datemodified).format("DD/MM/YY") }</div> : null */}
          </div>
        </div>

        {/* dialog */}
        <Dialog
          isOpen={ open }
          onClose={ this.toggleDialog.bind(this) }
          title={ name }
          lazy={false}
          inline={false}
          className="is-fullscreen"
        >
          <div className="pt-dialog-body">
            <div className="render">
              <CodeEditor initialValue={studentcontent} readOnly={true} showEditor={false} ref={c => this.editor = c} />
            </div>
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-byline">
              { t("Created by") } { username }
              <a href={ embedLink } target="_blank" className="share-link">{ embedLink }</a>
            </div>
            <div className="pt-dialog-footer-actions">
              { user
                ? <Popover
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
                    <ReportBox reportid={id} contentType="project" handleReport={this.handleReport.bind(this)}/>
                  </div>
                </Popover>
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

ProjectCard = connect(state => ({
  location: state.location,
  user: state.auth.user
}))(ProjectCard);
ProjectCard = translate()(ProjectCard);
export default ProjectCard;
