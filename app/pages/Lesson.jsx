import React, {Component} from "react";
import {translate, Interpolate} from "react-i18next";

class Lesson extends Component {

  render() {
    
    const {t} = this.props;

    return (
      <div>
        <h1>Lessons</h1>
        <ul>
        	<li>Lesson 1</li>
        	<li>Lesson 2</li>
        	<li>Lesson 3</li>
        </ul>
      </div>
    );
  }
}

export default translate()(Lesson);