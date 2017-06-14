import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listSlidesByTrackAndTopicAndLesson} from "api";

class Slide extends Component {

  onKeyPress(event) {
    if (event.which === 13 /* Enter */) {
      event.preventDefault();
    }
  }

  render() {
    
    const {t} = this.props;

    const {trid, tid, lid, sid} = this.props.params;

    const slideArray = listSlidesByTrackAndTopicAndLesson(trid, tid, lid);

    const SLIDE_TYPES = {
      TEST: "test",
      QUIZ: "quiz"
    };
    
    const currentSid = parseInt(sid.split("-")[1], 10);
    const currentSlide = slideArray[currentSid - 1];
    const prevSlideSlug = `slide-${currentSid - 1}`;
    const nextSlideSlug = `slide-${currentSid + 1}`;

    return (
      <div>
        <h1>{trid}: {tid}: {lid}: { t(currentSlide.title) }</h1>
        <p>{currentSlide.content}</p>
        <p>{currentSlide.type === SLIDE_TYPES.QUIZ ? <form onKeyPress={this.onKeyPress}>Answer: <input type="text" name="answer" /></form> : null }</p>
        { currentSid > 1 ? <Link className="link" to={`/track/${trid}/${tid}/${lid}/${prevSlideSlug}`}>previous</Link> : <span>previous</span> }
        &nbsp;&nbsp;&nbsp;
        { currentSid < slideArray.length ? <Link className="link" to={`/track/${trid}/${tid}/${lid}/${nextSlideSlug}`}>next</Link> : <span>next</span> } 
        <br/><br/>
        <Link className="link" to={`/track/${trid}/${tid}`}>return to {tid}</Link><br/>
        <Link className="link" to={`/track/${trid}`}>return to {trid}</Link>
        <br/><br/>
        <Nav />
      </div>
    );
  }
}

export default translate()(Slide);
