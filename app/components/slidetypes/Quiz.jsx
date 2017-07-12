import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Quiz.css";

export default class Quiz extends Component {

  onChooseAnswer(question) {
    if (question.isCorrect) {
      alert("That's correct!");
      this.props.unblock();
    } 
    else {
      alert("Incorrect, please try again!");
    }
  }

  render() {
    
    const {t, htmlcontent1, quizjson} = this.props;

    const quizjson_parsed = JSON.parse(quizjson);

    const quizItems = quizjson_parsed.map(question =>
      <li className="question" key={question.text} onClick={this.onChooseAnswer.bind(this, question)}>{question.text}</li>);

    return (
      <div id="q_container">
        <div id="q_question-container">{htmlcontent1}</div>
        <div id="q_choice-container"><ul id="q_choices">{quizItems}</ul></div>
      </div>
    );
  }
}
