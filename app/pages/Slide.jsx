import axios from "axios";
import Confetti from "react-dom-confetti";
import {connect} from "react-redux";
import {Link, browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Position, Intent, Tooltip, Dialog} from "@blueprintjs/core";

import Loading from "components/Loading";
import Discussion from "components/Discussion";

import ImageText from "components/slidetypes/ImageText";
import InputCode from "components/slidetypes/InputCode";
import Quiz from "components/slidetypes/Quiz";
import TextCode from "components/slidetypes/TextCode";
import TextImage from "components/slidetypes/TextImage";
import TextText from "components/slidetypes/TextText";
import RenderCode from "components/slidetypes/RenderCode";
import CheatSheet from "components/slidetypes/CheatSheet";

import "./Slide.css";

const compLookup = {TextImage, ImageText, TextText, TextCode, InputCode, RenderCode, Quiz, CheatSheet};

class Slide extends Component {

  constructor(props) {
    super(props);
    this.state = {
      slides: [],
      currentSlide: null,
      blocked: true,
      currentLevel: null,
      currentIsland: null,
      levels: null,
      skipped: false,
      showDiscussion: false,
      sentProgress: false,
      latestSlideCompleted: 0,
      islandComplete: false,
      mounted: false,
      done: false
    };
  }

  unblock() {
    const {slides, currentSlide, latestSlideCompleted} = this.state;
    const i = slides.indexOf(currentSlide);
    let newlatest = latestSlideCompleted;
    if (i > latestSlideCompleted) newlatest = i;
    if (this.state.mounted) this.setState({latestSlideCompleted: newlatest, blocked: false});
  }

  saveProgress(level) {
    const status = this.state.skipped ? "skipped" : "completed";
    axios.post("/api/userprogress/save", {level, status}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
    });
  }

  componentDidUpdate() {
    const {mlid, sid} = this.props.params;
    const {user} = this.props.auth;
    const {currentSlide, currentLevel, slides, sentProgress, latestSlideCompleted} = this.state;

    // going to new level
    if (currentLevel && currentLevel.id !== mlid) {
      this.setState({
        slides: [],
        currentSlide: null,
        blocked: true,
        currentLevel: null,
        currentIsland: null,
        levels: null,
        skipped: false,
        showDiscussion: false,
        sentProgress: false,
        latestSlideCompleted: 0,
        islandComplete: false,
        done: false
      }, this.hitDB.bind(this));
      return;
    }

    // going to new slide
    if (currentSlide && currentSlide.id !== sid) {
      const cs = slides.find(slide => slide.id === sid);
      let blocked = ["InputCode", "Quiz"].indexOf(cs.type) !== -1;
      if (slides.indexOf(cs) <= latestSlideCompleted) blocked = false;
      if (this.state.done) blocked = false;
      this.setState({currentSlide: cs, blocked, showDiscussion: false});
    }

    const i = slides.indexOf(currentSlide);
    if (this.state.mounted && currentSlide &&
      ["InputCode", "Quiz"].indexOf(currentSlide.type) === -1 &&
      i !== this.state.latestSlideCompleted && i > this.state.latestSlideCompleted) {
      this.setState({latestSlideCompleted: i});
    }

    const isFinalSlide = slides && currentSlide && slides.indexOf(currentSlide) === slides.length - 1;
    // if final slide write to DB
    if (user && isFinalSlide && !sentProgress) {
      this.setState({sentProgress: true, islandComplete: true});
      this.saveProgress(mlid);
    }
  }

  componentDidMount() {
    this.setState({mounted: true});

    this.hitDB.bind(this)();

    document.addEventListener("keypress", this.handleKey.bind(this));
  }

  hitDB() {
    const {lid, mlid} = this.props.params;
    let {sid} = this.props.params;
    const {slides, latestSlideCompleted} = this.state;

    const sget = axios.get(`/api/slides/all?mlid=${mlid}`);
    const upget = axios.get("/api/userprogress/mine");

    Promise.all([sget, upget]).then(resp => {
      const slideList = resp[0].data;
      slideList.sort((a, b) => a.ordering - b.ordering);
      if (sid === undefined) {
        sid = slideList[0].id;
        browserHistory.push(`/island/${lid}/${mlid}/${sid}`);
      }

      const currentIsland = this.props.islands.find(i => i.id === lid);

      const cs = slideList.find(slide => slide.id === sid);

      const up = resp[1].data.progress;
      const done = up.find(p => p.level === mlid && p.status === "completed") !== undefined;

      const levels = this.props.levels.filter(l => l.lid === lid);
      const currentLevel = levels.find(l => l.id === mlid);

      let blocked = ["InputCode", "Quiz"].indexOf(cs.type) !== -1;
      if (slides.indexOf(cs) <= latestSlideCompleted) blocked = false;
      if (done) blocked = false;
      this.setState({currentSlide: cs, slides: slideList, blocked, done, currentIsland, levels, currentLevel});
    });
  }

  handleKey(e) {
    e.keyCode === 96 && this.props.auth.user.role > 0 ? this.unblock(this) : null;
  }

  editSlide() {
    const {lid, mlid, sid} = this.props.params;
    browserHistory.push(`/admin/lesson-builder/${lid}/${mlid}/${sid}`);
  }

  advanceLevel(mlid) {
    const {lid} = this.props.params;
    browserHistory.push(`/island/${lid}/${mlid}`);
    if (window) window.location.reload();
  }

  toggleSkip() {
    if (!this.state.skipped) {
      this.setState({confirmSkipOpen: !this.state.confirmSkipOpen, showDiscussion: true, skipped: true});
    }
    else {
      this.setState({confirmSkipOpen: !this.state.confirmSkipOpen});
    }
  }

  toggleDiscussion() {
    if (!this.state.skipped) {
      this.setState({confirmSkipOpen: true});
    }
    else {
      this.setState({showDiscussion: !this.state.showDiscussion});
    }
  }

  render() {
    const {auth, t} = this.props;
    const {lid, mlid, sid} = this.props.params;
    const {currentSlide, slides, levels, currentLevel, currentIsland, showDiscussion} = this.state;

    if (!auth.user) browserHistory.push("/");

    const i = slides.indexOf(currentSlide);
    const prevSlug = i > 0 ? slides[i - 1].id : null;
    const nextSlug = i < slides.length - 1 ? slides[i + 1].id : null;

    let SlideComponent = null;

    const config = {
      angle: 270,
      spread: 180,
      startVelocity: 20,
      elementCount: 100,
      decay: 0.93
    };

    if (!currentSlide || !currentIsland || !currentLevel) return <Loading />;

    const nextLevel = levels.find(l => l.ordering === currentLevel.ordering + 1);

    const sType = currentSlide.type;

    SlideComponent = compLookup[sType];

    return (
      <div className="slide-outer">
        <div id="slide" className={ `slide-inner ${currentIsland.theme}` }>
          {this.props.auth.user.role > 0 ? <span style={{position: "absolute", left: "10px", top: "10px"}} onClick={this.editSlide.bind(this)} className="pt-icon-large pt-icon-edit" /> : null}
          <Confetti className="confetti" config={config} active={ this.state.islandComplete } />
          <Dialog
            iconName="warning"
            isOpen={this.state.confirmSkipOpen}
            onClose={this.toggleSkip.bind(this)}
            title="Are you sure?"
            canOutsideClickClose={false}
          >
            <div className="pt-dialog-body">
              {
                t(`Viewing user discussion can include some very helpful insights, but will mark this level
                as incomplete. Don't forget, you can always come back later and complete the island without
                any help to get full credit!`)
              }
            </div>
            <div className="pt-dialog-footer">
              <div className="pt-dialog-footer-actions">
                <button className="pt-button" onClick={() => this.setState({confirmSkipOpen: false})}>{t("Cancel")}</button>
                <button className="pt-button pt-intent-primary" onClick={this.toggleSkip.bind(this)}>{t("Show Me")}</button>
              </div>
            </div>
          </Dialog>
          <div className="slide-header" id="slide-head">
            { currentSlide.title ? <h1 className="title">{ currentSlide.title }</h1> : null }

            <Tooltip
              className="return-link"
              tooltipClassName={ currentIsland.theme }
              content={ `${ t("Return to") } ${currentIsland.name}` }
              position={Position.TOP_RIGHT}>
              <Link to={`/island/${lid}`}><span className="pt-icon-large pt-icon-layout-linear"></span></Link>
            </Tooltip>
          </div>

          <SlideComponent
            island={currentIsland.theme}
            unblock={this.unblock.bind(this)}
            {...currentSlide} />

          <div className="slide-footer">
            { prevSlug
              ? <Link className="pt-button pt-intent-primary" to={`/island/${lid}/${mlid}/${prevSlug}`}>{t("Previous")}</Link>
              : <div className="pt-button pt-disabled">{t("Previous")}</div>
            }
            { nextSlug
              ? this.state.blocked
                ? <div className="pt-button pt-disabled">{t("Next")}</div>
                : <Link className="pt-button pt-intent-primary" to={`/island/${lid}/${mlid}/${nextSlug}`}>{t("Next")}</Link>
              : nextLevel
                ? <Link className="pt-button pt-intent-success editor-link" to={`/island/${lid}/${nextLevel.id}`}>{t("Next Level")}</Link>
                : <Link className="pt-button pt-intent-success editor-link" to={`/island/${lid}`}>{`${t("Return to")} ${currentIsland.name}!`}</Link>
            }
          </div>
        </div>
        {/* discussion */}
        <button className={ `pt-button discussion-toggle ${ showDiscussion ? "pt-active" : "" }` } onClick={this.toggleDiscussion.bind(this)}>
          { showDiscussion ? t("Hide Discussion") : `${t("Show Discussion")} (${this.state.currentSlide.threadlist.length})` }
          { showDiscussion ? <span className="pt-icon-standard pt-icon-eye-off pt-align-right"></span> : <span className="pt-icon-standard pt-icon-comment pt-align-right"></span> }
        </button>
        { showDiscussion ? <Discussion permalink={this.props.router.location.pathname} subjectType="slide" subjectId={sid}/> : null }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  islands: state.islands,
  levels: state.levels
});

Slide = connect(mapStateToProps)(Slide);
export default translate()(Slide);
