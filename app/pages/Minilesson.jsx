import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Minilesson.css";

class Minilesson extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minilessons: null,
      currentLesson: null,
      userProgress: null,
      otherSnippets: null
    };
  }

  componentDidMount() {
    const {lid} = this.props.params;
    const mlget = axios.get(`/api/minilessons?lid=${lid}`);
    const lget = axios.get(`/api/lessons?id=${lid}`);
    const uget = axios.get("/api/userprogress");
    const osget = axios.get(`/api/snippets/othersbylid?lid=${lid}`);

    Promise.all([mlget, lget, uget, osget]).then(resp => {
      this.setState({minilessons: resp[0].data, currentLesson: resp[1].data[0], userProgress: resp[2].data, otherSnippets: resp[3].data});
    });
  }

  displaySnippet(snippet) {
    alert(`Make a modal box with: \n\n${snippet.studentcontent}`);
  }

  render() {

    const {t} = this.props;
    const {lid} = this.props.params;
    const {minilessons, currentLesson, userProgress, otherSnippets} = this.state;

    if (!currentLesson || !minilessons || !userProgress || !otherSnippets) return <h1>Loading...</h1>;

    const minilessonItems = minilessons.map(minilesson =>
      <li key={minilesson.id}><Link className={userProgress.find(up => up.level === minilesson.id) !== undefined ? "ml_link completed" : "ml_link"} to={`/lesson/${lid}/${minilesson.id}`}>{ minilesson.name }</Link></li>);

    const otherSnippetItems = otherSnippets.map(os =>
      <li key={os.id}><Link className="othersnippet-link" onClick={this.displaySnippet.bind(this, os)}> {`${os.id}'s Snippet`}</Link></li>);

    return (
      <div>
        <h1>{currentLesson.name}</h1>
        <p>{currentLesson.description}</p>
        <ul>{minilessonItems}</ul>
        <Link className="editor-link" to={`/editor/${lid}`}>Go to my editor (My Snippet)</Link>
        <br/><br/>
        <strong>Other Snippets</strong>
        <ul>{otherSnippetItems}</ul>
      </div>
    );
  }
}

Minilesson = connect(state => ({
  user: state.auth.user
}))(Minilesson);
Minilesson = translate()(Minilesson);
export default Minilesson;
