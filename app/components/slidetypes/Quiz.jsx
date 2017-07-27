import React, {Component} from "react";
import {Position, Toaster, Intent} from "@blueprintjs/core";

export default class Quiz extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  onChooseAnswer(question) {
    const t = Toaster.create({className: "quizToast", position: Position.TOP_CENTER});
    if (question.isCorrect) {
      t.show({message: "That's right!", timeout: 1500, intent: Intent.SUCCESS});
      this.props.unblock();
    }
    else {
      t.show({message: "Sorry, Try again!", timeout: 1500, intent: Intent.DANGER});
    }
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
        </div>
      </div>
    );
  }
}
