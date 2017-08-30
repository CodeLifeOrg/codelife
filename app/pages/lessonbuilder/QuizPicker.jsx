import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import {Checkbox} from "@blueprintjs/core";

import "./QuizPicker.css";

class QuizPicker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      quiz: null,
      parentID: null
    };
  }

  componentDidMount() {
    const quiz = this.extractQuiz(this.props.quiz);
    const {parentID} = this.props;
    this.setState({quiz, parentID});   
  }

  componentDidUpdate() {
    if (this.props.parentID !== this.state.parentID) {
      const quiz = this.extractQuiz(this.props.quiz);
      const {parentID} = this.props;
      this.setState({quiz, parentID});
    }
  }

  extractQuiz(quizjson) {
    let quiz = [];
    if (quizjson) {
      quiz = JSON.parse(quizjson);
      for (let i = 0; i < quiz.length; i++) {
        quiz[i].id = i;
      }
    }
    return quiz;
  }

  changeQuestion(e) {
    const {quiz} = this.state;
    quiz[e.target.id].text = e.target.value;
    this.setState({quiz});
  }

  handleCheckbox(e) {
    const {quiz} = this.state;
    if (e.target.checked) {
      quiz.map(q => q.isCorrect = false);
      quiz[e.target.id].isCorrect = e.target.checked;  
    }
    this.setState({quiz});
  }

  addAnswer() {
    
  }

  render() {

    const {quiz} = this.state;

    let quizItems = [];
    if (quiz) {
      quizItems = quiz.map(q => 
        <div className="quiz-section" style={{display: "flex"}}>
          <textarea className="pt-input" id={q.id} rows="3" onChange={this.changeQuestion.bind(this)} type="text" placeholder="Question" dir="auto" value={q.text} /> 
          <Checkbox className="pt-large" id={q.id} checked={q.isCorrect} onChange={this.handleCheckbox.bind(this)} style={{margin: "12px"}} />        
        </div>
      );
    }
    
    return (
      <div id="quiz-picker">
        <label className="pt-label">
          Quiz
          {quizItems}
          <button className="pt-button pt-intent-success pt-icon-add" type="button" onClick={this.addAnswer.bind(this)}>Add Answer</button>
        </label>
      </div>
    );
  }
}

QuizPicker = connect(state => ({
  auth: state.auth
}))(QuizPicker);
QuizPicker = translate()(QuizPicker);
export default QuizPicker;
