import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";
import { Link } from 'react-router';

class Slide extends Component {

  render() {
    
    const {t} = this.props;

    const {lid, tid} = this.props.params

    //todo - have topicArray come from json-in-the-sky, using id to cherrypick
    const slideArray = ["slide-1", "slide-2", "slide-3", "slide-4"];
    const slideItems = slideArray.map((slide) => <li>{slide}</li>);

    return (
      <div>
        <h1>{lid}: {tid}: Slides</h1>
        <ul>{slideItems}</ul>
      </div>
    );
  }
}

export default translate()(Slide);