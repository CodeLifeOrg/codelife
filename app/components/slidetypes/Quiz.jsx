import React, {Component} from "react";
import {Position, Toaster, Intent} from "@blueprintjs/core";

export default class Quiz extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      quizjson: null,
      activeQ: null
    };
  }

  onChooseAnswer(question) {
    const {updateGems} = this.props;
    const toast = Toaster.create({className: "quizToast", position: Position.TOP_CENTER});
    if (question.isCorrect) {
      toast.show({message: "That's right!", timeout: 1500, intent: Intent.SUCCESS});
      this.props.unblock();
      updateGems(1);
    }
    else {
      toast.show({message: "Sorry, Try again!", timeout: 1500, intent: Intent.DANGER});
      updateGems(-1);
    }
    this.setState({activeQ: question.text});
  }

  componentDidMount() {
    if (this.props.htmlcontent1) this.setState({prompt: this.props.htmlcontent1});
  }

  componentDidUpdate() {
    if (this.state.quizjson !== this.props.quizjson) {
      this.setState({quizjson: this.props.quizjson, activeQ: null});
    }
  }

  render() {

    const {htmlcontent1, quizjson} = this.props;

    let qText = htmlcontent1;
    let qParse = [{text: "Check with", isCorrect: true}, {text: "Administrator", isCorrect: false}];
    try {
      qParse = JSON.parse(quizjson);
    }
    catch (e) {
      qText = "Quiz Data is Unavailable.";
    }

    const quizItems = qParse.map(question => <li className={this.state.activeQ === question.text ? "question quiz-selected" : "question"} key={question.text} onClick={this.onChooseAnswer.bind(this, question)}>{question.text}</li>);

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
