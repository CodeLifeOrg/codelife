import React, {Component} from "react";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import axios from "axios";
import {Collapse} from "@blueprintjs/core";
import CodeBlockCard from "components/CodeBlockCard";
import "./CodeBlockList.css";

class CodeBlockList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      islands: [],
      isOpen: false,
      userProgress: null
    };
  }

  componentDidMount() {
    const cbget = axios.get("/api/codeBlocks/all");
    const upget = axios.get("/api/userprogress/mine");
    const MAX_LENGTH = 5;
    Promise.all([cbget, upget]).then(resp => {
      const allCodeBlocks = resp[0].data;
      const userProgress = resp[1].data.progress;
      const islands = this.props.islands.map(i => {
        i.myCodeBlocks = [];
        i.likedCodeBlocks = [];
        i.unlikedCodeBlocks = [];
        return i;
      });
      for (const cb of allCodeBlocks) {
        const island = islands.find(i => i.id === cb.lid);
        if (island) {
          if (cb.uid === this.props.auth.user.id) {
            island.myCodeBlocks.push(cb);
          }
          else {
            if (cb.liked) {
              if (island.likedCodeBlocks.length <= MAX_LENGTH) {
                island.likedCodeBlocks.push(cb);
              }
            }
            else {
              if (island.unlikedCodeBlocks.length <= MAX_LENGTH) {
                island.unlikedCodeBlocks.push(cb);
              }
            }
          }
        }
      }

      this.setState({islands, userProgress});
    });
  }

  reportLike(codeBlock) {
    const island = this.state.islands.find(l => l.id === codeBlock.lid);
    if (island) {
      let likedCodeBlocks = island.likedCodeBlocks.slice(0);
      let unlikedCodeBlocks = island.unlikedCodeBlocks.slice(0);
      if (codeBlock.uid === this.props.auth.user.id) return;
      if (codeBlock.liked) {
        likedCodeBlocks.push(codeBlock);
        unlikedCodeBlocks = unlikedCodeBlocks.filter(cb => cb.id !== codeBlock.id);
      }
      else {
        unlikedCodeBlocks.push(codeBlock);
        likedCodeBlocks = likedCodeBlocks.filter(cb => cb.id !== codeBlock.id);
      }
      likedCodeBlocks.sort((a, b) => b.likes - a.likes || b.id - a.id);
      unlikedCodeBlocks.sort((a, b) => b.likes - a.likes || b.id - a.id);
      island.likedCodeBlocks = likedCodeBlocks;
      island.unlikedCodeBlocks = unlikedCodeBlocks;
      // updating the parameter arrays of an island does not intrinsically update state
      // so we have to force an update to rearrange the render after a like is reported
      this.forceUpdate();
    }
  }

  handleClick(l) {
    this.setState({[l]: !this.state[l]});
  }

  handleFork(newid, projects) {
    if (this.props.handleFork) this.props.handleFork(newid, projects);
  }

  render() {
    const {islands, userProgress} = this.state;

    if (!islands || !userProgress) return null;

    const codeBlockItems = [];

    for (const i of islands) {
      // added this ordering blocker for november beta. Need to increment this as levels are unlocked.
      // incremented this for new december island
      // incremented this for new january island
      // island 7 is clock island, so if its higher, don't show anything
      if (i.likedCodeBlocks.length + i.unlikedCodeBlocks.length + i.myCodeBlocks.length === 0 || i.ordering > 7) continue;
      codeBlockItems.push(
        <button className={`u-unbutton codeblock-browser-button ${i.theme}`} key={i.id} onClick={this.handleClick.bind(this, i.id)}>
          <img className="codeblock-browser-button-icon" src={`/islands/${i.theme}-small.png`} />{ i.name }
        </button>
      );
      const thisIslandItems = [];
      for (const s of i.myCodeBlocks.concat(i.likedCodeBlocks, i.unlikedCodeBlocks)) {
        thisIslandItems.push(
          <CodeBlockCard blockFork={this.props.blockFork} handleFork={this.handleFork.bind(this)} theme={i.theme} icon={i.icon} codeBlock={s} userProgress={userProgress} reportLike={this.reportLike.bind(this)} projectMode={true}/>
        );
      }
      codeBlockItems.push(<Collapse className="card-list" isOpen={this.state[i.id]}>{thisIslandItems}</Collapse>);
    }

    return (
      <div className="codeblock-browser-list card-list">
        { codeBlockItems }
      </div>
    );
  }
}

CodeBlockList = connect(state => ({
  islands: state.islands,
  auth: state.auth
}))(CodeBlockList);
CodeBlockList = translate()(CodeBlockList);
export default CodeBlockList;
