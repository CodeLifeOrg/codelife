import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import { Link } from 'react-router';
import Nav from 'components/Nav';

class Slide extends Component {

  render() {
    
    const {t} = this.props;

    const {lid, tid, sid} = this.props.params;

    //todo - have slideArray come from json-in-the-sky, using id to cherrypick
    const slideArray = [
      {
        "sid": "slide-1",
        "title": "slide 1",
        "content": "i am the content of slide 1"
      },
      {
        "sid": "slide-2",
        "title": "slide 2",
        "content": "i am the content of slide 2"
      },
      {
        "sid": "slide-3",
        "title": "slide 3",
        "content": "i am the content of slide 3"
      },
      {
        "sid": "slide-4",
        "title": "slide 4",
        "content": "i am the content of slide 4"
      }
      ];
    
    const currentSid = parseInt(sid.split('-')[1]);
    const currentSlide = slideArray[currentSid - 1];
    const prevSlideSlug = `slide-${currentSid-1}`
    const nextSlideSlug = `slide-${currentSid+1}`

    return (
      <div>
        <h1>{lid}: {tid}: {currentSlide.title}</h1>
        <p>{currentSlide.content}</p>
        { currentSid > 1 ? <Link className="link" to={`/lesson/${lid}/${tid}/${prevSlideSlug}`}>previous</Link> : <span>previous</span> }
        &nbsp;&nbsp;&nbsp;
        { currentSid < slideArray.length ? <Link className="link" to={`/lesson/${lid}/${tid}/${nextSlideSlug}`}>next</Link> : <span>next</span> } 
        <br/><br/>
        <Link classname="link" to={`/lesson/${lid}`}>return to {lid}</Link>
        <Nav />
      </div>
    );
  }
}

export default translate()(Slide);