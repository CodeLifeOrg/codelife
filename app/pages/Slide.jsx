import axios from "axios";
import {connect} from "react-redux";
import {Link, browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Tooltip} from "@blueprintjs/core";

import Loading from "components/Loading";

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
      currentLesson: null,
      minilessons: null,
      sentProgress: false,
      latestSlideCompleted: 0, 
      mounted: false
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
    axios.post("/api/userprogress/save", {level}).then(resp => {
      resp.status === 200 ? console.log("success") : console.log("error");
    });
  }

  componentDidUpdate() {
    const {lid, mlid, sid} = this.props.params;
    const {user} = this.props;
    const {currentSlide, slides, sentProgress, latestSlideCompleted} = this.state;

    if (currentSlide && currentSlide.id !== sid) {
      const cs = slides.find(slide => slide.id === sid);
      let blocked = ["InputCode", "Quiz"].indexOf(cs.type) !== -1;
      if (slides.indexOf(cs) <= latestSlideCompleted) blocked = false;
      this.setState({currentSlide: cs, blocked});
    }

    const isFinalSlide = slides && currentSlide && slides.indexOf(currentSlide) === slides.length - 1;
    if (user && isFinalSlide && !sentProgress) {
      this.setState({sentProgress: true});
      this.saveProgress(mlid);
    }

    const i = slides.indexOf(currentSlide);
    if (this.state.mounted && currentSlide && ["InputCode", "Quiz"].indexOf(currentSlide.type) === -1 && i !== this.state.latestSlideCompleted && i > this.state.latestSlideCompleted) {
      this.setState({latestSlideCompleted: i});
    }
  }

  componentDidMount() {
    this.setState({mounted: true});

    const {lid, mlid} = this.props.params;
    let {sid} = this.props.params;
    const {slides, latestSlideCompleted} = this.state;

    const sget = axios.get(`/api/slides?mlid=${mlid}`);
    const lget = axios.get(`/api/lessons?id=${lid}`);
    const mlget = axios.get(`/api/minilessons?lid=${lid}`);

    Promise.all([sget, lget, mlget]).then(resp => {
      const slideList = resp[0].data;
      slideList.sort((a, b) => a.ordering - b.ordering);
      if (sid === undefined) {
        sid = slideList[0].id;
        browserHistory.push(`/lesson/${lid}/${mlid}/${sid}`);
      }
      const cs = slideList.find(slide => slide.id === sid);
      let blocked = ["InputCode", "Quiz"].indexOf(cs.type) !== -1;
      if (slides.indexOf(cs) <= latestSlideCompleted) blocked = false;
      this.setState({currentSlide: cs, slides: slideList, blocked, currentLesson: resp[1].data[0], minilessons: resp[2].data});
    });

    document.addEventListener("keydown", this.handleKey.bind(this));
  }

  handleKey(e) {
    e.keyCode === 192 ? this.unblock(this) : null;
  }

  render() {

    const {t} = this.props;
    const {lid, mlid} = this.props.params;
    const {currentSlide, slides, currentLesson} = this.state;

    const i = slides.indexOf(currentSlide);
    const prevSlug = i > 0 ? slides[i - 1].id : null;
    const nextSlug = i < slides.length - 1 ? slides[i + 1].id : null;

    let SlideComponent = null;

    if (!currentSlide || !currentLesson) return <Loading />;

    SlideComponent = compLookup[currentSlide.type];

    return (
      <div id="slide" className={ currentLesson.id }>

        <div id="slide-head">
          <h1 className="title">{ currentSlide.title }</h1>
          <Tooltip className="return-link" content={ `${ t("return to") } ${currentLesson.name}` } tooltipClassName={ currentLesson.id }>
            <Link to={`/lesson/${lid}`}><span className="pt-icon-large pt-icon-cross"></span></Link>
          </Tooltip>
        </div>

        <SlideComponent unblock={this.unblock.bind(this)} {...currentSlide} />

        <div id="slide-foot">
          { prevSlug
          ? <Link className="pt-button pt-intent-primary" to={`/lesson/${lid}/${mlid}/${prevSlug}`}>Previous</Link>
          : <div className="pt-button pt-disabled">Previous</div> }
          { nextSlug
          ? this.state.blocked
            ? <div className="pt-button pt-disabled">Next</div>
            : <Link className="pt-button pt-intent-primary" to={`/lesson/${lid}/${mlid}/${nextSlug}`}>Next</Link>
          : <Link className="pt-button pt-intent-success editor-link" to={`/lesson/${lid}`}>{`Back to ${currentLesson.name}!`}</Link> }
        </div>

      </div>
    );
  }
}

Slide = connect(state => ({
  user: state.auth.user
}))(Slide);
Slide = translate()(Slide);
export default Slide;
