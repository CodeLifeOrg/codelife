import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import Loading from "components/Loading";

import "./QuizPicker.css";

class QuizPicker extends Component {

  constructor(props) {
    super(props);
    this.state = {
      quiz: null
    };
  }

  componentDidMount() {
    const {quiz} = this.props;
    this.setState({quiz});   
  }

  render() {

    const {quiz} = this.state;

    if (!quiz) return <Loading />;
    
    return (
      <div id="quiz-picker">
        <label className="pt-label">
          Quiz
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
