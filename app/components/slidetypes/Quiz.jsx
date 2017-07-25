import React, {Component} from "react";
import {translate} from "react-i18next";
import {Alert} from "@blueprintjs/core";
import "./Quiz.css";

export default class Quiz extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  onChooseAnswer(question) {
    let alertText = "";
    if (question.isCorrect) {
      alertText = "That's Correct!";
      this.props.unblock();
    } 
    else {
      alertText = "Incorrect, please try again!";
    }
    this.setState({isOpen: true, alertText});
  }

  handleClose() {
    this.setState({isOpen: false});
  }

  buildAlert() {
    return (
      <Alert
        className="quiz-alert"
        isOpen={this.state.isOpen}
        confirmButtonText="Okay"
        onConfirm={this.handleClose.bind(this)}
      >
      <p>
        {this.state.alertText}
      </p>
      </Alert>
    );
  }

  render() {
    
    const {t, htmlcontent1, quizjson} = this.props;

    const quizItems = JSON.parse(quizjson).map(question =>
      <li className="question" key={question.text} onClick={this.onChooseAnswer.bind(this, question)}>{question.text}</li>);

    const alert = this.buildAlert.bind(this);

    return (
      <div id="q_container">
        <div id="q_question-container">{htmlcontent1}</div>
        <div id="q_choice-container"><ul id="q_choices">{quizItems}</ul></div>
        {alert}
      </div>
    );
  }
}
