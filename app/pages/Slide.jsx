import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link, browserHistory} from "react-router";
import Nav from "components/Nav";
import {listSlidesByMinilessonID} from "api";
import axios from "axios";

class Slide extends Component {

  constructor(props) {
    super(props);
    this.state = {
      slides: [],
      currentSlide: null
    };
  }

  // For quiz slides, override the enter key so we don't submit.
  onKeyPress(event) {
    if (event.which === 13 /* Enter */) {
      event.preventDefault();
    }
  }

  componentDidUpdate() {
    const {sid} = this.props.params;
    const {currentSlide, slides} = this.state;
    if (slides !== [] && currentSlide && currentSlide.id !== +sid) {
      const cs = slides.find(slide => slide.id === +sid);
      this.setState({currentSlide: cs});
    }
  }

  componentDidMount() {
    const {lid, mlid} = this.props.params;
    let {sid} = this.props.params;

    // const slideList = listSlidesByMinilessonID(+mlid);
    
    axios.get(`/api/slides?mlid=${+mlid}`).then(resp => {
      const slideList = resp.data;
      slideList.sort((a, b) => a.ordering - b.ordering);
      if (sid === undefined) {
        sid = slideList[0].id;
        browserHistory.push(`/lesson/${lid}/${mlid}/${sid}`);
      }
      const cs = slideList.find(slide => slide.id === +sid);
      this.setState({currentSlide: cs, slides: slideList});
    });  
  }

  render() {
    
    const {t} = this.props;
    const {lid, mlid} = this.props.params;
    const {currentSlide, slides} = this.state;

    const i = slides.indexOf(currentSlide);
    const prevSlug = i > 0 ? slides[i - 1].id : null;
    const nextSlug = i < slides.length - 1 ? slides[i + 1].id : null;
    
    // Right now, slides have types, encoded in the database as "type"
    // TODO: Break these out into components that can be included on a slide
    // as opposed to having a single "type" for an entire slide.
    const SLIDE_TYPES = {
      TEXT: "test",
      QUIZ: "quiz",
      TEXTWITHIMAGE: "textWithImage"
    };

    if (!currentSlide) return <h1>Loading</h1>;
    
    return (
      <div> 
        <h1>{currentSlide.title}</h1>
        <p>{currentSlide.content}</p>
        <p>{currentSlide.type === SLIDE_TYPES.QUIZ ? <form onKeyPress={this.onKeyPress}>Answer: <input type="text" name="answer" /></form> : null }</p>
        <p>{currentSlide.type === SLIDE_TYPES.TEXTWITHIMAGE ? <img className="image" src={`/${currentSlide.img}`} /> : null }</p>      

        { prevSlug ? <Link className="link" to={`/lesson/${lid}/${mlid}/${prevSlug}`}>previous</Link> : <span>previous</span> }
        &nbsp;&nbsp;&nbsp;
        { nextSlug ? <Link className="link" to={`/lesson/${lid}/${mlid}/${nextSlug}`}>next</Link> : <span>next</span> }  

        <br/><br/>
        <Link className="link" to={`/lesson/${lid}`}>return to lesson {lid}</Link>
        <br/><br/>
        <Nav />
      </div>
    );
  }
}

export default translate()(Slide);

