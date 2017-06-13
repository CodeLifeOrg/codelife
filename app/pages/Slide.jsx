import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import { Link } from 'react-router';

class Slide extends Component {

  render() {
    
    const {t} = this.props;

    const {lid, tid} = this.props.params

    //todo - have slideArray come from json-in-the-sky, using id to cherrypick
    const slideArray = [
      {
        "sid": "sid-1",
        "title": "slide 1",
        "content": "i am the content of slide 1"
      },
      {
        "sid": "sid-2",
        "title": "slide 2",
        "content": "i am the content of slide 2"
      },
      {
        "sid": "sid-3",
        "title": "slide 3",
        "content": "i am the content of slide 3"
      },
      {
        "sid": "sid-4",
        "title": "slide 4",
        "content": "i am the content of slide 4"
      },
      ];

    return (
      <div>
        <h1>{lid}: {tid}: Slides</h1>
      </div>
    );
  }
}

export default translate()(Slide);