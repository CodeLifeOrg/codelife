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
      codeBlocks: [],
      userProgress: null
    };
  }

  componentDidMount() {
    const upget = axios.get("/api/userprogress");
    const cbget = axios.get("/api/codeBlocks/mine");

    Promise.all([upget, cbget]).then(resp => {
      const userProgress = resp[0].data.progress;
      const codeBlocks = resp[1].data;
      this.setState({userProgress, codeBlocks});
    });
  }

  hasUserCompleted(milestone) {
    // TODO: this is a blocking short-circuit for August. remove after Beta (done)
    // TODO2: adding back in a hard blocker for November Beta.
    if (milestone === "island-863f") return false;
    return this.state.userProgress.find(up => up.level === milestone) !== undefined;
  }

  // TODO: I think this is a remnant from when you could see codeblocks at the island level, revisit this
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

    const {codeBlocks, userProgress} = this.state;
    const {auth, islands} = this.props;

    if (!auth.user) browserHistory.push("/");

    if (islands === [] || !userProgress) return <Loading />;

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

const mapStateToProps = state => ({
  auth: state.auth,
  islands: state.islands
});

Island = connect(mapStateToProps)(Island);
export default translate()(Island);
