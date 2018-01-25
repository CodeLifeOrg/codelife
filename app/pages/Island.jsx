import axios from "axios";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import "./Island.css";
import IslandLink from "components/IslandLink";
import Loading from "components/Loading";

/**
 * Displays all available islands
 */
class Island extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userProgress: null
    };
  }

  /**
   * On mount, fetch the progress for the currently logged in user.
   */
  componentDidMount() {
    const upget = axios.get("/api/userprogress/mine");

    Promise.all([upget]).then(resp => {
      const userProgress = resp[0].data.progress;
      this.setState({userProgress});
    });
  }

  /**
   * On mount, fetch the progress for the currently logged in user.
   * @param {String} milestone An island ID.
   * @returns {Boolean} Returns a boolean whether or not the user has completed the provided island ID.
   */
  hasUserCompleted(milestone) {
    // TODO: this is a blocking short-circuit for August. remove after Beta (done)
    // TODO2: adding back in a hard blocker for November Beta.
    // TODO3: blocker incremented for December Island.
    // TODO4: blocker incremented for January Island.
    if (milestone === "island-8b75") return false;
    return this.state.userProgress.find(up => up.level === milestone) !== undefined;
  }

  render() {

    const {userProgress} = this.state;
    const {auth, islands} = this.props;

    if (!auth.user) browserHistory.push("/");

    if (islands === [] || !userProgress) return <Loading />;

    const islandArray = islands.slice(0);

    for (let i = 0; i < islandArray.length; i++) {
      const done = this.hasUserCompleted(islandArray[i].id);
      islandArray[i].isDone = done;
      islandArray[i].isNext = i === 0 && !done || i > 0 && !done && islandArray[i - 1].isDone;
    }

    return (
      <div className="overworld">
        <div className="map">
          { islandArray.map(island => <IslandLink key={island.id} island={island} />) }
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
