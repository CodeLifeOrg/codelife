import React, {Component} from "react";
import {translate} from "react-i18next";
import "./LearnMore.css";

class LearnMore extends Component {

  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  render() {
    const {t} = this.props;

    return (
      <div id="learnmore-container">
        <h1>{ t("Learn More") }</h1>
        <p>{ t("There are many resources you can use to learn about coding online.  Here are just a few!") }</p>
        <ul>
          <li><a target="_blank" href="https://scratch.mit.edu/">MIT Scratch</a></li>
          <li><a target="_blank" href="https://www.khanacademy.org/">Khan Academy</a></li>
          <li><a target="_blank" href="https://www.codecademy.com/">MIT Scratch</a></li>
          <li><a target="_blank" href="https://www.datacamp.com/">DataCamp</a></li>
        </ul>
      </div>
    );
  }
}

export default translate()(LearnMore);
