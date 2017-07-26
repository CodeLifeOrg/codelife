import React, {Component} from "react";
import {Alert} from "@blueprintjs/core";

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

  render() {

    const {htmlcontent1, quizjson} = this.props;

    let qText = htmlcontent1;
    let qParse = [{text: "Go Check the JSON.", isCorrect: true}, {text: "I don't wanna", isCorrect: false}];
    try {
      qParse = JSON.parse(quizjson);
    } 
    catch (e) {
      qText = "Json's Busted Yo";
    }

    const quizItems = qParse.map(question => <li className="question" key={question.text} onClick={this.onChooseAnswer.bind(this, question)}>{question.text}</li>);

    return (
      <div id="slide-container" className="quiz flex-row">
        <div className="slide-quiz">
          <div dangerouslySetInnerHTML={{__html: qText}} />
          <ol className="questions">
            {quizItems}
          </ol>
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
        </div>
      </div>
    );
  }
}
