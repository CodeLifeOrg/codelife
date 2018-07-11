import axios from "axios";
import Confetti from "react-dom-confetti";
import {connect} from "react-redux";
import {Link} from "react-router";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Dialog} from "@blueprintjs/core";

import LoadingSpinner from "components/LoadingSpinner";
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

// A component cannot be dynamically instantiated via a string unless references to the 
// classes are stored directly in a lookup object such as this one.
const compLookup = {TextImage, ImageText, TextText, TextCode, InputCode, RenderCode, Quiz, CheatSheet};

/**
 * The slide component is the wrapper for all the various slidetypes in Codelife. However, 
 * it interacts a great deal with the db and greater site, as reaching the last slide 
 * updates user progress, and each slide has a Discussion board beneath it. It's important
 * to note that currently a Level must be beaten all at once - the "latestSlideCompleted" 
 * variable in state is not persisted anywhere, and leaving the lesson does not restart the
 * user halfway through a level. Longer term, more granular tracking of user location would
 * be a nice enhancement.
 */

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

  /**
   * InputCode and Quiz slides are "blockers" in that they do not allow progress until a correct
   * answer is provided. This function is called when the user beats a slide.
   */
  unblock() {
    const {slides, currentSlide, latestSlideCompleted} = this.state;
    const i = slides.indexOf(currentSlide);
    let newlatest = latestSlideCompleted;
    if (i > latestSlideCompleted) newlatest = i;
    if (this.state.mounted) this.setState({latestSlideCompleted: newlatest, blocked: false});
  }

  /**
   * When the user reaches the final slide, write the level to the userprogress table.
   * If the user looks at the discussion board, this level is marked as "skipped", which
   * ultimately does not count towards overall completion%. Completing the level without
   * help marks the level as completed.
   */
  saveProgress(level) {
    const status = this.state.skipped ? "skipped" : "completed";
    axios.post("/api/userprogress/save", {level, status}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
    });
  }

  /**
   * Slide.jsx handles all the transitions from slide to slide, so a lot of work need be done
   * when the user changes slides. The simplest case is beating a single slide, but they also
   * may have beaten this lesson (db write), reached a blocking slide, or be changing levels entirely
   */
  componentDidUpdate() {
    // The level id (mlid) and slide id (sid) come in via URL params
    const {mlid, sid} = this.props.params;
    const {user} = this.props.auth;
    const {currentSlide, currentLevel, slides, sentProgress, latestSlideCompleted} = this.state;

    // going to new level, reset most elements of state
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
      if (cs) {
        // if the new slide is inputcode/quiz, block the student from advancing
        let blocked = ["InputCode", "Quiz"].indexOf(cs.type) !== -1;
        if (slides.indexOf(cs) <= latestSlideCompleted) blocked = false;
        // ... unless they have beaten it in the past
        if (this.state.done) blocked = false;
        this.setState({currentSlide: cs, blocked, showDiscussion: false});
      }
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

  /** 
   * On mount, hit the DB and add the keyboard listener
   */
  componentDidMount() {
    this.setState({mounted: true});

    this.hitDB.bind(this)();

    document.addEventListener("keypress", this.handleKey.bind(this));
  }

  /**
   * Given the island / level / slide (lid, mlid, sid) from the URL params
   * Fetch the slides and userprogress from the db and start from the first slides
   */ 
  hitDB() {
    const {lid, mlid} = this.props.params;
    let {sid} = this.props.params;
    const {slides, latestSlideCompleted} = this.state;
    const {browserHistory} = this.context;

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

  /**
   * Admin-only direct link to the CMS to edit a slide's content
   */
  editSlide() {
    const {lid, mlid, sid} = this.props.params;
    const {browserHistory} = this.context;
    browserHistory.push(`/admin/lesson-builder/${lid}/${mlid}/${sid}`);
  }

  /**
   * When the user goes to the next level, push the new URL and hard-reload. This should 
   * be refactored to a more React-y state reset.
   */
  advanceLevel(mlid) {
    const {lid} = this.props.params;
    const {browserHistory} = this.context;
    browserHistory.push(`/island/${lid}/${mlid}`);
    if (window) window.location.reload();
  }

  /**
   * Show or hide the "show discussion" confirm/deny menu
   */
  toggleSkip() {
    if (!this.state.skipped) {
      this.setState({confirmSkipOpen: !this.state.confirmSkipOpen, showDiscussion: true, skipped: true});
    }
    else {
      this.setState({confirmSkipOpen: !this.state.confirmSkipOpen});
    }
  }

  /**
   * Reveal or hide the discussion component.
   */
  toggleDiscussion() {
    if (!this.state.skipped) {
      this.setState({confirmSkipOpen: true});
    }
    else {
      this.setState({showDiscussion: !this.state.showDiscussion});
    }
  }

  /**
   * When a Discussion board posts a new thread, Slide needs to know this has happened.
   * This callback pushes the new thread onto the list so the "thread count" updates
   */
  onNewThread(thread) {
    const {currentSlide} = this.state;
    if (currentSlide) {
      currentSlide.threadlist.push(thread);
    }
  }

  render() {
    const {auth, t} = this.props;
    const {lid, mlid, sid} = this.props.params;
    const {currentSlide, slides, levels, currentLevel, currentIsland, showDiscussion} = this.state;
    const {browserHistory} = this.context;

    if (!auth.user) browserHistory.push("/");

    const i = slides.indexOf(currentSlide);
    const prevSlug = i > 0 ? slides[i - 1].id : null;
    const nextSlug = i < slides.length - 1 ? slides[i + 1].id : null;

    let SlideComponent = null;

    // config for confetti 
    const config = {
      angle: 270,
      spread: 180,
      startVelocity: 20,
      elementCount: 100,
      decay: 0.93
    };

    if (!currentSlide || !currentIsland || !currentLevel) return <LoadingSpinner />;

    const nextLevel = levels.find(l => l.ordering === currentLevel.ordering + 1);

    const sType = currentSlide.type;

    // As mentioned earlier, there is no way to dynamically instantiate a component via
    // a string identifier. As such, we look up the reference in a lookup table and 
    // instantiate it later 
    SlideComponent = compLookup[sType];

    return (
      <div className="slide-outer">
        <div id="slide" className={ `slide-inner ${currentIsland.theme}` }>
          <Confetti className="confetti" config={config} active={ this.state.islandComplete } />
          <Dialog
            className="form-container u-text-center"
            iconName="warning"
            isOpen={this.state.confirmSkipOpen}
            onClose={() => this.setState({confirmSkipOpen: false})}
            title="" >
            <h2 className="font-lg">{t("Are you sure?")}</h2>
            <p className="font-md">
              { t("DiscussionWarning") }
            </p>
            <div className="font-sm u-button-group u-margin-top-sm">
              <button className="button inverted-button" onClick={() => this.setState({confirmSkipOpen: false})}>{t("Cancel")}</button>
              <button className="button" onClick={this.toggleSkip.bind(this)}>{t("Show Me")}</button>
            </div>
          </Dialog>
          <div className="slide-header" id="slide-head">
            { currentSlide.title
              ? <h1 className="slide-title font-lg">{ currentSlide.title }
                { this.props.auth.user.role > 0
                  ? <button className="u-unbutton slide-title-edit" onClick={this.editSlide.bind(this)} >
                    <span className="pt-icon-standard pt-icon-edit slide-title-edit-icon" />
                    <span className="u-visually-hidden">Edit slide</span>
                  </button>
                  : null }
              </h1>
              : null }

            <Link className="return-link" to={`/island/${lid}`}>
              <span className="font-sm u-hide-below-sm">
                { t("Return to") } { currentIsland.name }
              </span>
              <span className="pt-icon pt-icon-cross" />
            </Link>
          </div>

          <SlideComponent
            island={currentIsland.theme}
            // If this slide component is InputCode or Quiz, hook up the callback 
            // to unblock Slide.jsx when the user gets it right
            unblock={this.unblock.bind(this)}
            // This may be confusing, it is the only place in codelife where the data is 
            // DIRECTLY prop'd into the component as opposed to something like slideData=currentSlide.
            // This means the properties are available directly in this.props inside each slide.
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
                ? <Link className="pt-button pt-intent-primary editor-link" to={`/island/${lid}/${nextLevel.id}`}>{t("Next Level")}</Link>
                : <Link className="pt-button pt-intent-primary editor-link" to={`/island/${lid}`}>{`${t("Return to")} ${currentIsland.name}!`}</Link>
            }
          </div>
          { !nextSlug && nextLevel &&
            <div className="centered-buttons return">
              <Link className="pt-button pt-intent-primary" to={`/island/${lid}`}>
                {`${t("Return to")} ${currentIsland.name}`}
              </Link>
            </div>
          }
        </div>
        {/* discussion */}
        <button className={ `button inverted-button discussion-toggle font-sm ${ showDiscussion ? "is-active" : "is-inactive" }` } onClick={this.toggleDiscussion.bind(this)}>
          <span className={`pt-icon ${ showDiscussion ? "pt-icon-eye-off" : "pt-icon-chat" }`} />
          { showDiscussion ? t("Hide Discussion") : `${t("Show Discussion")} (${this.state.currentSlide.threadlist.length})` }
        </button>
        { showDiscussion ? <Discussion permalink={this.props.router.location.pathname} subjectType="slide" onNewThread={this.onNewThread.bind(this)} subjectId={currentSlide.id}/> : null }
      </div>
    );
  }
}

Slide.contextTypes = {
  browserHistory: PropTypes.object
};

const mapStateToProps = state => ({
  auth: state.auth,
  islands: state.islands,
  levels: state.levels
});

Slide = connect(mapStateToProps)(Slide);
export default translate()(Slide);
