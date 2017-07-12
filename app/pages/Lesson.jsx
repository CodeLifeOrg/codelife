import React, {Component} from "react";
import {translate} from "react-i18next";
import {Link} from "react-router";
import {connect} from "react-redux";
import Nav from "components/Nav";
import axios from "axios";

class Lesson extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gotUserFromDB: false,
      lessons: []
    };
  }

  componentDidUpdate() {
    if (this.props.user && !this.state.gotUserFromDB) {
      this.setState({gotUserFromDB: true});
    }
  }

  componentDidMount() {
    axios.get("/api/lessons/").then(resp => {
      this.setState({lessons: resp.data});
    });
  }

  render() {
    
    const {t} = this.props;
    const {lessons, gotUserFromDB} = this.state;
    const {user} = this.props;

    if (!gotUserFromDB || lessons === []) return <h1>Loading...</h1>;

    const lessonItems = lessons.map(lesson => 
      <li key={lesson.id}><Link className="link" to={`/lesson/${lesson.id}`}>{ lesson.name }</Link></li>);

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
