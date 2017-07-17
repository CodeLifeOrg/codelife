import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import Nav from "components/Nav";
import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Lesson.css";

class Lesson extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lessons: [],
      userProgress: null
    };
  }

  componentDidMount() {
    axios.get("/api/lessons/").then(resp => {
      axios.get("/api/userprogress").then(prog => {
        this.setState({userProgress: prog.data, lessons: resp.data});
      });
    });
   
  }

  render() {
    
    const {t} = this.props;
    const {lessons, userProgress} = this.state;
    const {user} = this.props;

    if (lessons === [] || !userProgress) return <h1>Loading...</h1>;

    const lessonItems = lessons.map(lesson => 
      <li key={lesson.id}><Link className={userProgress.find(up => up.level === lesson.id) !== undefined ? "l_link completed" : "l_link"} to={`/lesson/${lesson.id}`}>{ lesson.name }</Link></li>);

    return (
      <div>
        <h1>{t("Islands")}</h1>
        <p>Welcome Back, {user.username}!</p>
        <ul>{lessonItems}</ul>
        <Nav />
      </div>
    );
  }
}

Lesson = connect(state => ({
  user: state.auth.user
}))(Lesson);
Lesson = translate()(Lesson);
export default Lesson;
