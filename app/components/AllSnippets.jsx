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
      isOpen: false,
      userProgress: null
    };
  }

  componentDidMount() {
    const {t} = this.props;
    const asget = axios.get("/api/snippets/all");
    const lget = axios.get("/api/lessons");
    const upget = axios.get("/api/userprogress");
    const lkget = axios.get("/api/likes");
    Promise.all([asget, lget, upget, lkget]).then(resp => {
      const allSnippets = resp[0].data;
      const lessons = resp[1].data;
      const userProgress = resp[2].data;
      const likes = resp[3].data;
      allSnippets.sort((a, b) => b.likes - a.likes || b.id - a.id);
      for (const l of lessons) {
        l.mySnippets = [];
        l.likedSnippets = [];
        l.unlikedSnippets = [];
        for (const s of allSnippets) {
          if (s.uid === this.props.auth.user.id) {
            s.username = t("you!");
            s.mine = true;
            if (likes.find(l => l.likeid === s.id)) s.liked = true;
            if (s.lid === l.id) l.mySnippets.push(s);
          }
          else {
            if (s.lid === l.id) {
              // TODO: move this to db call, don't do this here
              if (likes.find(l => l.likeid === s.id)) {
                s.liked = true;
                l.likedSnippets.push(s);
              }
              else {
                s.liked = false;
                l.unlikedSnippets.push(s);
              }
            }
          }
        }
      }
      this.setState({lessons, userProgress});
    });
  }

  reportLike(codeBlock) {
    const lesson = this.state.lessons.find(l => l.id === codeBlock.lid);
    if (lesson) {
      const likedSnippets = lesson.likedSnippets.slice(0);
      const unlikedSnippets = lesson.unlikedSnippets.slice(0);
      if (codeBlock.mine) return;
      if (codeBlock.liked) {
        likedSnippets.push(codeBlock);
        unlikedSnippets.splice(unlikedSnippets.map(s => s.id).indexOf(codeBlock.id), 1);
      }
      else {
        unlikedSnippets.push(codeBlock);
        likedSnippets.splice(likedSnippets.map(s => s.id).indexOf(codeBlock.id), 1);
      }
      likedSnippets.sort((a, b) => b.likes - a.likes || b.id - a.id);
      unlikedSnippets.sort((a, b) => b.likes - a.likes || b.id - a.id);
      lesson.likedSnippets = likedSnippets;
      lesson.unlikedSnippets = unlikedSnippets;
      // updating the parameter arrays of a lesson does not intrinsically update state
      // so we have to force an update to rearrange the render after a like is reported
      this.forceUpdate();
    }
  }

  handleClick(l) {
    this.setState({[l]: !this.state[l]});
  }

  render() {
    const {lessons, userProgress} = this.state;

    if (!lessons || !userProgress) return null;

    const snippetItems = [];

    for (const l of lessons) {
      snippetItems.push(
        <li className={`lesson-header ${l.id}`} key={l.id}>
          <div className="lesson-title" style={{cursor: "pointer"}} onClick={this.handleClick.bind(this, l.id)} ><img src={`/islands/${l.id}-small.png`} width="30px" height="30px"/>{l.name}</div>
        </li>
      );
      const thisLessonItems = [];
      for (const s of l.mySnippets.concat(l.likedSnippets, l.unlikedSnippets)) {
        thisLessonItems.push(
          <li><CodeBlockCard codeBlock={s} reportLike={this.reportLike.bind(this)} projectMode={true}/></li>
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
  auth: state.auth
}))(AllSnippets);
AllSnippets = translate()(AllSnippets);
export default AllSnippets;
