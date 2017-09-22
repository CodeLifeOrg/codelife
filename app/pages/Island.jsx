import axios from "axios";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Island.css";
import IslandLink from "components/IslandLink";
import Loading from "components/Loading";

class Island extends Component {

  constructor(props) {
    super(props);
    this.state = {
      islands: [],
      codeBlocks: [],
      userProgress: null
    };
  }

  componentDidMount() {
    const iget = axios.get("/api/lessons/");
    const upget = axios.get("/api/userprogress");
    const cbget = axios.get("/api/snippets");

    Promise.all([iget, upget, cbget]).then(resp => {
      const islands = resp[0].data;
      islands.sort((a, b) => a.ordering - b.ordering);
      const userProgress = resp[1].data;
      const codeBlocks = resp[2].data;
      this.setState({islands, userProgress, codeBlocks});
    });
  }

  hasUserCompleted(milestone) {
    // TODO: this is a blocking short-circuit for August. remove after Beta
    if (milestone === "island-3") return false;
    return this.state.userProgress.find(up => up.level === milestone) !== undefined;
  }

  handleSave(sid, studentcontent) {
    // TODO: i think i hate this.  when CodeBlock saves, I need to change the state of Lesson's snippet array
    // so that subsequent opens will reflect the newly saved code.  In a perfect world, a CodeBlock save would
    // reload all snippets freshly from the database, but I also want to minimize db hits.  revisit this.
    const {codeBlocks} = this.state;
    for (const cb of codeBlocks) {
      if (cb.id === sid) cb.studentcontent = studentcontent;
    }
    this.setState(codeBlocks);
  }

  render() {

    const {islands, codeBlocks, userProgress} = this.state;

    const {auth} = this.props;

    if (!auth.user) browserHistory.push("/login");

    if (islands === [] || !userProgress) return <Loading />;

    // clone the array so we don't mess with state
    // TODO: i've subsequently learned this is unnecessary, revisit this
    const islandArray = islands.slice(0);

    for (let i = 0; i < islandArray.length; i++) {
      islandArray[i].codeBlock = codeBlocks.find(s => s.lid === islandArray[i].id);
      const done = this.hasUserCompleted(islandArray[i].id);
      islandArray[i].isDone = done;
      islandArray[i].isNext = i === 0 && !done || i > 0 && !done && islandArray[i - 1].isDone;
    }

    return (
      <div className="overworld">
        <div className="map">
          { islandArray.map(island => <IslandLink island={island} />) }
        </div>
      </div>
    );
  }
}

Island = connect(state => ({
  auth: state.auth
}))(Island);
Island = translate()(Island);
export default Island;
