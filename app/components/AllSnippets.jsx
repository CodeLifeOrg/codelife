import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import {Collapse} from "@blueprintjs/core";
import CodeBlockCard from "components/CodeBlockCard";
import "./Snippets.css";

class AllSnippets extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lessons: null,
      isOpen: false
    };
  }

  componentDidMount() {
    const osget = axios.get("/api/snippets/allothers");
    const sget = axios.get("/api/snippets/");
    const lget = axios.get("/api/lessons");
    Promise.all([sget, osget, lget]).then(resp => {
      const mysnippets = resp[0].data;
      const othersnippets = resp[1].data;
      const lessons = resp[2].data;
      for (const l of lessons) {
        l.snippets = [];
        l.top = 5;
      }
      for (const ms of mysnippets) {
        for (const l of lessons) {
          ms.username = "you!";
          if (ms.lid === l.id) l.snippets.push(ms);
        }
      }
      othersnippets.sort((a, b) => b.likes - a.likes);
      for (const os of othersnippets) {
        for (const l of lessons) {
          if (os.lid === l.id) {
            os.starred = l.top > 0;
            l.top--;
            l.snippets.push(os);
          }
        }
      }
      this.setState({lessons});
    });
  }

  handleClick(l) {
    this.setState({[l]: !this.state[l]});
  }

  render() {

    const {t} = this.props;
    const {lessons} = this.state;

    if (!lessons) return null;

    const snippetItems = [];

    for (const l of lessons) {
      snippetItems.push(
        <li className={`lesson-header ${l.id}`} key={l.id}>
          <div className="lesson-title" style={{cursor: "pointer"}} onClick={this.handleClick.bind(this, l.id)} ><img src={`/islands/${l.id}-small.png`} width="30px" height="30px"/>{l.name}</div>
        </li>
      );
      const thisLessonItems = [];
      for (const s of l.snippets) {
        thisLessonItems.push(
          <li><CodeBlockCard codeBlock={s} breakout={true} projectMode={true}/></li>
        );
      }
      snippetItems.push(<Collapse isOpen={this.state[l.id]}>{thisLessonItems}</Collapse>);
    }

    return (
      <div id="snippets">
        <ul className="snippets-list">
          { snippetItems }
        </ul>
      </div>
    );
  }
}

AllSnippets = connect(state => ({
  user: state.auth.user
}))(AllSnippets);
AllSnippets = translate()(AllSnippets);
export default AllSnippets;
