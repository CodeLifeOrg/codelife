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
      snippets: [],
      userProgress: null
    };
  }

  componentDidMount() {
    const lget = axios.get("/api/lessons/");
    const upget = axios.get("/api/userprogress");
    const sget = axios.get("/api/snippets");

    Promise.all([lget, upget, sget]).then(resp => {
      this.setState({lessons: resp[0].data, userProgress: resp[1].data, snippets: resp[2].data});
    });
  }

  displaySnippet(snippet) {
    alert(`Make a modal box with: \n\n${snippet.studentcontent}`);
  }

  render() {
    
    const {t} = this.props;
    const {lessons, snippets, userProgress} = this.state;
    const {user} = this.props;

    if (lessons === [] || !userProgress) return <h1>Loading...</h1>;

    // clone the array so we don't mess with state
    const lessonArray = lessons.slice(0);

    for (const l of lessonArray) {
      l.snippet = snippets.find(s => s.lid === l.id);
    }

    const lessonItems = lessonArray.map(lesson => 
      <li key={lesson.id}>
        <Link className={userProgress.find(up => up.level === lesson.id) !== undefined ? "l_link completed" : "l_link"} 
              to={`/lesson/${lesson.id}`}>{ lesson.name } 
        </Link>
        <ul>
          <li><Link className="snippet-link" onClick={this.displaySnippet.bind(this, lesson.snippet)}>{`My ${lesson.name} Snippet`}</Link></li>
        </ul>
      </li>);

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
