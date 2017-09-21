import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Checkbox} from "@blueprintjs/core";

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

  handleCheckbox(e) {
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
        <div className="quiz-section" style={{display: "flex"}}>
          <textarea className="pt-input" id={q.id} rows="3" onChange={this.changeField.bind(this, "text")} type="text" placeholder="Answer" dir="auto" value={q.text} /> 
          <textarea className="pt-input" id={q.id} rows="3" onChange={this.changeField.bind(this, "pt_text")} type="text" placeholder="Answer" dir="auto" value={q.pt_text} /> 
          <Checkbox className="pt-large" id={q.id} checked={q.isCorrect} onChange={this.handleCheckbox.bind(this)} style={{margin: "12px"}} />        
          <button className="pt-button pt-intent-danger pt-icon-delete" type="button" id={q.id} onClick={this.removeAnswer.bind(this)}>Remove</button>
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
