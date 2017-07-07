import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import Nav from "components/Nav";
import axios from "axios";

class Lesson extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      lessons: []
    };
  }

  componentDidMount() {
    axios.get("/api/lessons/").then(resp => {
      this.setState({lessons: resp.data});
    });
  }

  render() {
    
    const {t} = this.props;
    const {lessons} = this.state;

    if (lessons === []) return <h1>Loading...</h1>;

    const lessonItems = lessons.map(lesson => 
      <li key={lesson.id}><Link className="link" to={`/lesson/${lesson.id}`}>{ lesson.name }</Link></li>);

    return (
      <div>
        <h1>{t("Lessons")}</h1>
        <ul>{lessonItems}</ul>
        <Nav />
      </div>
    );
  }
}

export default translate()(Lesson);
