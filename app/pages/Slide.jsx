import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import {listSlidesByTrackAndTopicAndLesson} from "api";

// Slide Page
// Shows slides, always starting with `slide-1`. Slide ids are stored as sid in the database.

class Slide extends Component {

  // For quiz slides, override the enter key so we don't submit.
  onKeyPress(event) {
    if (event.which === 13 /* Enter */) {
      event.preventDefault();
    }
  }

  render() {
    
    const {t} = this.props;

    // Get all the ids from our URL, to give a clear picture of where we are.
    // We'll need these ids to look up the slides for this Track/Topic/Lesson combo.
    const {trid, tid, lid, sid} = this.props.params;

    const slideArray = listSlidesByTrackAndTopicAndLesson(trid, tid, lid);

    // Right now, slides have types, encoded in the database as "type"
    // TODO: Break these out into components that can be included on a slide
    // as opposed to having a single "type" for an entire slide.
    const SLIDE_TYPES = {
      TEXT: "test",
      QUIZ: "quiz",
      TEXTWITHIMAGE: "textWithImage"
    };
    
    // Some string cutting/manip is necessary to increment "slide-2" to "slide-3" etc.
    const currentSid = parseInt(sid.split("-")[1], 10);
    const currentSlide = slideArray[currentSid - 1];
    const prevSlideSlug = `slide-${currentSid - 1}`;
    const nextSlideSlug = `slide-${currentSid + 1}`;

    const img = currentSlide.img;

    return (
      <div>
        <h1>{trid}: {tid}: {lid}: { t(currentSlide.title) }</h1>
        <p>{ t(currentSlide.content) }</p>
        { /*
          As mentioned earlier, slides have types.  The dumb logic below justs asks
          what type this slide is, and inserts content based on that type.
          TODO: Break these out into components: slides should not have a single type, 
          but rather should be a collection of Components
        */}
        <p>{currentSlide.type === SLIDE_TYPES.QUIZ ? <form onKeyPress={this.onKeyPress}>Answer: <input type="text" name="answer" /></form> : null }</p>
        <p>{currentSlide.type === SLIDE_TYPES.TEXTWITHIMAGE ? <img className="image" src={`/${img}`} /> : null }</p>
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
