import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Switch} from "@blueprintjs/core";

import "./QuizPicker.css";

class QuizPicker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      quiz: null,
      parentID: null
    };
  }

  componentDidMount() {
    const {data, parentID} = this.props;
    const quiz = this.extractQuiz(this.props.data.quizjson, this.props.data.pt_quizjson);
    this.setState({data, quiz, parentID});
  }

  componentDidUpdate() {
    if (this.props.parentID !== this.state.parentID) {
      const {data, parentID} = this.props;
      const quiz = this.extractQuiz(this.props.data.quizjson, this.props.data.pt_quizjson);
      this.setState({data, quiz, parentID});
    }
  }

  extractQuiz(quizjson, langjson) {
    let quiz = [];
    let langQuiz = [];
    if (quizjson && langjson) {
      quiz = JSON.parse(quizjson);
      langQuiz = JSON.parse(langjson);
      for (let i = 0; i < quiz.length; i++) {
        quiz[i].id = i;
        quiz[i].pt_text = langQuiz[i].text;
      }
    }
    return quiz;
  }

  changeField(field, e) {
    const {quiz} = this.state;
    quiz[e.target.id][field] = e.target.value;
    this.setState({quiz}, this.updateJSON.bind(this));
  }

  handleSwitch(e) {
    const {quiz} = this.state;
    if (e.target.checked) {
      quiz.map(q => q.isCorrect = false);
      quiz[e.target.id].isCorrect = e.target.checked;
    }
    this.setState({quiz}, this.updateJSON.bind(this));
  }

  updateJSON() {
    const {data, quiz} = this.state;
    const json = [];
    const langjson = [];
    if (quiz) {
      for (let i = 0; i < quiz.length; i++) {
        json[i] = {
          text: quiz[i].text,
          isCorrect: quiz[i].isCorrect
        };
        langjson[i] = {
          text: quiz[i].pt_text,
          isCorrect: quiz[i].isCorrect
        };
      }
    }
    data.quizjson = JSON.stringify(json);
    data.pt_quizjson = JSON.stringify(langjson);
    this.setState({data});
  }

  addAnswer() {
    const {quiz} = this.state;
    const nextID = quiz.length;
    quiz.push({
      id: nextID,
      text: "Set Answer Text",
      pt_text: "",
      isCorrect: false
    });
    this.setState({quiz}, this.updateJSON.bind(this));
  }

  removeAnswer(e) {
    const {quiz} = this.state;
    const newQuiz = [];
    let i = 0;
    for (const q of quiz) {
      if (q.id !== Number(e.target.id)) {
        q.id = i;
        newQuiz[i] = q;
        i++;
      }
    }
    this.setState({quiz: newQuiz}, this.updateJSON.bind(this));
  }

  render() {

    const {quiz} = this.state;

    let quizItems = [];
    if (quiz) {
      quizItems = quiz.map(q =>
        <div key={q.id} className="quiz-section">
          <Switch className="pt-large u-margin-bottom-off" id={q.id} checked={q.isCorrect} onChange={this.handleSwitch.bind(this)} />
          <div className="field-container u-margin-top-off">
            <textarea className="pt-input en" id={q.id} rows="3" onChange={this.changeField.bind(this, "text")} type="text" placeholder="Answer" dir="auto" value={q.text} />
          </div>
          <div className="field-container u-margin-top-off">
            <textarea className="pt-input" id={q.id} rows="3" onChange={this.changeField.bind(this, "pt_text")} type="text" placeholder="Answer" dir="auto" value={q.pt_text} />
          </div>
          <div className="quiz-actions u-text-center">
            <button className="button inverted-button danger-button font-sm" id={q.id} onClick={this.removeAnswer.bind(this)}>
              <span className="pt-icon pt-icon-trash" />
              remove
            </button>
          </div>
        </div>
      );
    }

    return (
      <div id="quiz-picker">
        <h3>Answers</h3>
        <div className="quiz-section font-sm u-margin-bottom-off">
          <p className="pt-switch">Correct</p>
          <p className="field-container u-text-center">Answer (En)</p>
          <p className="field-container u-text-center">Answer (Pt)</p>
          <p className="quiz-actions u-text-center">Actions</p>
        </div>
        {quizItems}
        <button className="button"
          onClick={this.addAnswer.bind(this)}>
          <span className="pt-icon pt-icon-add" />
          add answer
        </button>
      </div>
    );
  }
}

QuizPicker = connect(state => ({
  auth: state.auth
}))(QuizPicker);
QuizPicker = translate()(QuizPicker);
export default QuizPicker;
