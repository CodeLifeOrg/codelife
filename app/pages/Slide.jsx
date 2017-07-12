import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link, browserHistory} from "react-router";
import Nav from "components/Nav";
import ImageText from "components/slidetypes/ImageText";
import InputCode from "components/slidetypes/InputCode";
import Quiz from "components/slidetypes/Quiz";
import TextCode from "components/slidetypes/TextCode";
import TextImage from "components/slidetypes/TextImage";
import TextText from "components/slidetypes/TextText";
import axios from "axios";
import "./Slide.css";

const compLookup = {TextImage, ImageText, TextText, TextCode, InputCode, Quiz};

class Slide extends Component {

  constructor(props) {
    super(props);
    this.state = {
      slides: [],
      currentSlide: null,
      blocked: true
    };
  }

  unblock() {
    this.setState({blocked: false});
  }

  componentDidUpdate() {
    const {sid} = this.props.params;
    const {currentSlide, slides} = this.state;
    if (currentSlide && currentSlide.id !== sid) {
      const cs = slides.find(slide => slide.id === sid);
      const blocked = ["InputCode", "Quiz"].indexOf(cs.type) !== -1;
      this.setState({currentSlide: cs, blocked});
    }
  }

  componentDidMount() {
    const {lid, mlid} = this.props.params;
    let {sid} = this.props.params;
    
    axios.get(`/api/slides?mlid=${mlid}`).then(resp => {
      const slideList = resp.data;
      slideList.sort((a, b) => a.ordering - b.ordering);
      if (sid === undefined) {
        sid = slideList[0].id;
        browserHistory.push(`/lesson/${lid}/${mlid}/${sid}`);
      }
      const cs = slideList.find(slide => slide.id === sid);
      const blocked = ["InputCode", "Quiz"].indexOf(cs.type) !== -1;
      this.setState({currentSlide: cs, slides: slideList, blocked});
    });  
  }

  render() {
    
    const {t} = this.props;
    const {lid, mlid} = this.props.params;
    const {currentSlide, slides} = this.state;

    const i = slides.indexOf(currentSlide);
    const prevSlug = i > 0 ? slides[i - 1].id : null;
    const nextSlug = i < slides.length - 1 ? slides[i + 1].id : null;

    let SlideComponent = null;

    if (!currentSlide) return <h1>Loading...</h1>;
    
    SlideComponent = compLookup[currentSlide.type];
    
    return (
      <div> 
        <h1>{currentSlide.title}</h1>

        <SlideComponent unblock={this.unblock.bind(this)} {...currentSlide} />

        <div id="slugcontainer"> 
          { prevSlug ? <Link className="navlink" to={`/lesson/${lid}/${mlid}/${prevSlug}`}>previous</Link> : <span className="deadlink">previous</span> }
          { nextSlug && !this.state.blocked ? <Link className="navlink" to={`/lesson/${lid}/${mlid}/${nextSlug}`}>next</Link> : <span className="deadlink">next</span> }  
        </div>
        <div id="returncontainer">
          { !nextSlug ? <Link className="editor-link" to={`/editor/${lid}`}>Try it out in my editor!</Link> : null }
          <br/><br/>
          <Link className="link" to={`/lesson/${lid}`}>return to lesson {lid}</Link>
        </div>
        <Nav />
      </div>
    );
  }
}

export default translate()(Slide);

