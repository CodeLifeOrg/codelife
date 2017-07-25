import React, {Component} from "react";

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

    const {htmlcontent1, quizjson} = this.props;

    const quizjsonParsed = JSON.parse(quizjson);

    const quizItems = quizjsonParsed.map(question =>
      <li className="question" key={question.text} onClick={this.onChooseAnswer.bind(this, question)}>{question.text}</li>);

    return (
      <div id="slide-container" className="quiz flex-row">
        <div className="slide-quiz">
          <div dangerouslySetInnerHTML={{__html: htmlcontent1}} />
          <ol className="questions">
            {quizItems}
          </ol>
        </div>
      </div>
    );
  }
}
