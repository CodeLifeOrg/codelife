import React, {Component} from "react";
import {Position, Toaster, Intent} from "@blueprintjs/core";
import {translate} from "react-i18next";

class Quiz extends Component {

  constructor(props) {
    super(props);
    this.state = {
      slideId: null,
      isOpen: false,
      quizjson: null,
      activeQ: null
    };
  }

  onChooseAnswer(question) {
    const {t} = this.props;
    const toast = Toaster.create({className: "quizToast", position: Position.TOP_CENTER});
    if (question.isCorrect) {
      toast.show({message: t("You got it right!"), timeout: 1500, intent: Intent.SUCCESS});
      if (this.props.unblock) this.props.unblock();
    }
    else {
      toast.show({message: t("Sorry, Try again!"), timeout: 1500, intent: Intent.DANGER});
    }
    this.setState({activeQ: question.text});
  }

  componentDidMount() {
    if (this.props.htmlcontent1) this.setState({prompt: this.props.htmlcontent1});
  }

  componentDidUpdate() {
    // TODO: change update logic from json compare to something better (slideId compare?)
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
      <div id="slide-content" className="slide-content quiz flex-row">
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

Quiz = translate()(Quiz);
export default Quiz;
