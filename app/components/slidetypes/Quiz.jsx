import React, {Component} from "react";
import {Position, Toaster, Intent} from "@blueprintjs/core";
import {translate} from "react-i18next";

/**
 * Quiz is a blocking multiple-choice question, powered by the quizjson column in the slides db
 */

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

  /**
   * Callback for clicking an answer. Check ths JSON, and unblock the parent Slide if correct
   */
  onChooseAnswer(question) {
    if (!this.props.readOnly) {
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
  }

  /**
   * On Mount, populate the quiz prompt from props
   */
  componentDidMount() {
    if (this.props.htmlcontent1) this.setState({prompt: this.props.htmlcontent1});
  }

  /**
   * When the user changes slides, update the quizjson in state.
   */
  componentDidUpdate() {
    // TODO: change update logic from json compare to something better (slideId compare?)
    if (this.state.quizjson !== this.props.quizjson) {
      this.setState({quizjson: this.props.quizjson, activeQ: null});
    }
  }

  render() {

    const {htmlcontent1, quizjson} = this.props;

    { /* This catch is from when quizjson was written by hand, hopefully the CMS should catch these */ }
    let qText = htmlcontent1;
    let qParse = [{text: "Check with", isCorrect: true}, {text: "Administrator", isCorrect: false}];
    try {
      qParse = JSON.parse(quizjson);
    }
    catch (e) {
      qText = "Quiz Data is Unavailable.";
    }

    const quizItems = qParse.map(question =>
      <li onClick={this.onChooseAnswer.bind(this, question)} className={this.state.activeQ === question.text ? "question quiz-selected" : "question"} key={question.text}>
        <button className="quiz-button u-unbutton">
          {question.text}
        </button>
      </li>
    );

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
