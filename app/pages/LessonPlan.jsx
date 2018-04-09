import React, {Component} from "react";
import {translate} from "react-i18next";
import Loading from "components/Loading";
import "./LessonPlan.css";

class LessonPlan extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  render() {
    
    const {mounted} = this.state;
    
    if (!mounted) return <Loading />;
    
    return (
      <div id="lesson-plan" className="content">
        i am a lesson plan
      </div>
    );
  }
}

export default translate()(LessonPlan);
