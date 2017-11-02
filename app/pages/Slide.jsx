import axios from "axios";
import Confetti from "react-dom-confetti";
import {connect} from "react-redux";
import {Link, browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Position, Tooltip} from "@blueprintjs/core";

import Loading from "components/Loading";

import ImageText from "components/slidetypes/ImageText";
import InputCode from "components/slidetypes/InputCode";
import Quiz from "components/slidetypes/Quiz";
import TextCode from "components/slidetypes/TextCode";
import TextImage from "components/slidetypes/TextImage";
import TextText from "components/slidetypes/TextText";
import RenderCode from "components/slidetypes/RenderCode";
import CheatSheet from "components/slidetypes/CheatSheet";

import gemIcon from "icons/gem.svg";

import "./Slide.css";

const compLookup = {TextImage, ImageText, TextText, TextCode, InputCode, RenderCode, Quiz, CheatSheet};

class Slide extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gems: 0,
      slides: [],
      currentSlide: null,
      blocked: true,
      currentIsland: null,
      levels: null,
      sentProgress: false,
      latestSlideCompleted: 0,
      latestSlideOfGemEarned: -1,
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

  saveProgress(level, gems) {
    axios.post("/api/userprogress/save", {level, gems}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
    });
  }

  componentDidUpdate() {
    const {mlid, sid} = this.props.params;
    const {user} = this.props.auth;
    const {currentSlide, slides, sentProgress, latestSlideCompleted, gems} = this.state;

    // going to new slide
    if (currentSlide && currentSlide.id !== sid) {
      const cs = slides.find(slide => slide.id === sid);
      let blocked = ["InputCode", "InputCodeExec", "Quiz"].indexOf(cs.type) !== -1;
      if (slides.indexOf(cs) <= latestSlideCompleted) blocked = false;
      if (this.state.done) blocked = false;
      this.setState({currentSlide: cs, blocked});
    }

    const i = slides.indexOf(currentSlide);
    if (this.state.mounted && currentSlide &&
      ["InputCode", "InputCodeExec", "Quiz"].indexOf(currentSlide.type) === -1 &&
      i !== this.state.latestSlideCompleted && i > this.state.latestSlideCompleted) {
      this.setState({latestSlideCompleted: i});
    }

    const isFinalSlide = slides && currentSlide && slides.indexOf(currentSlide) === slides.length - 1;
    // if final slide write to DB
    if (user && isFinalSlide && !sentProgress) {
      this.setState({sentProgress: true, islandComplete: true});
      // add 1 to gems since the saving happens before the user "finishes"
      // the final slide
      this.saveProgress(mlid, gems);
    }
  }

  componentDidMount() {
    this.setState({mounted: true});

    const {lid, mlid} = this.props.params;
    let {sid} = this.props.params;
    const {slides, latestSlideCompleted} = this.state;

    const sget = axios.get(`/api/slides?mlid=${mlid}`);
    const iget = axios.get(`/api/islands?id=${lid}`);
    const lget = axios.get(`/api/levels?lid=${lid}`);
    const upget = axios.get("/api/userprogress");

    Promise.all([sget, iget, lget, upget]).then(resp => {
      const slideList = resp[0].data;
      slideList.sort((a, b) => a.ordering - b.ordering);
      if (sid === undefined) {
        sid = slideList[0].id;
        browserHistory.push(`/island/${lid}/${mlid}/${sid}`);
      }
      const cs = slideList.find(slide => slide.id === sid);

      /*
      if (cs.ordering !== 0) {
        browserHistory.push(`/lesson/${lid}/${mlid}`);
        return;
      }
      */

      const up = resp[3].data.progress;
      const done = up.find(p => p.level === mlid) !== undefined;

      let blocked = ["InputCode", "InputCodeExec", "Quiz"].indexOf(cs.type) !== -1;
      if (slides.indexOf(cs) <= latestSlideCompleted) blocked = false;
      if (done) blocked = false;
      this.setState({currentSlide: cs, slides: slideList, blocked, done, currentIsland: resp[1].data[0], levels: resp[2].data});
    });

    document.addEventListener("keydown", this.handleKey.bind(this));
  }

  handleKey(e) {
    e.keyCode === 192 ? this.unblock(this) : null;
  }

  updateGems(newGems) {
    const {gems: oldGems, slides, currentSlide, latestSlideOfGemEarned} = this.state;
    console.log("latestSlideOfGemEarned", latestSlideOfGemEarned);
    const indexOfCurrentSlide = slides.indexOf(currentSlide);
    if (indexOfCurrentSlide > latestSlideOfGemEarned) {
      this.setState({gems: oldGems + newGems, latestSlideOfGemEarned: indexOfCurrentSlide});
    }
  }

  render() {
    const {auth, t} = this.props;
    const {lid, mlid} = this.props.params;
    const {currentSlide, slides, currentIsland, gems} = this.state;
    const updateGems = this.updateGems.bind(this);

    if (!auth.user) browserHistory.push("/login");

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

    if (!currentSlide || !currentIsland) return <Loading />;

    let exec = false;
    let sType = currentSlide.type;
    if (sType.includes("Exec")) {
      exec = true;
      sType = sType.replace("Exec", "");
    }

    SlideComponent = compLookup[sType];

    return (
      <div id="slide" className={ currentIsland.theme }>
        <Confetti className="confetti" config={config} active={ this.state.islandComplete } />
        <div id="slide-head">
          { currentSlide.title ? <h1 className="title">{ currentSlide.title }</h1> : null }

          { gems ? <div className="gems"><img src={gemIcon} />{t("Gems")}: {gems}</div> : null }
          <Tooltip className="return-link" content={ `${ t("Return to") } ${currentIsland.name}` } tooltipClassName={ currentIsland.theme } position={Position.TOP_RIGHT}>
            <Link to={`/island/${lid}`}><span className="pt-icon-large pt-icon-cross"></span></Link>
          </Tooltip>
        </div>

        <SlideComponent
          exec={exec}
          island={currentIsland.theme}
          updateGems={updateGems}
          unblock={this.unblock.bind(this)}
          {...currentSlide} />

        <div id="slide-foot">
          { prevSlug
          ? <Link className="pt-button pt-intent-primary" to={`/island/${lid}/${mlid}/${prevSlug}`}>{t("Previous")}</Link>
          : <div className="pt-button pt-disabled">{t("Previous")}</div> }
          { nextSlug
          ? this.state.blocked
            ? <div className="pt-button pt-disabled">{t("Next")}</div>
            : <Link className="pt-button pt-intent-primary" to={`/island/${lid}/${mlid}/${nextSlug}`}>{t("Next")}</Link>
          : <Link className="pt-button pt-intent-success editor-link" to={`/island/${lid}`}>{`${t("Return to")} ${currentIsland.name}!`}</Link> }
        </div>

      </div>
    );
  }
}

Slide = connect(state => ({
  auth: state.auth
}))(Slide);
Slide = translate()(Slide);
export default Slide;
