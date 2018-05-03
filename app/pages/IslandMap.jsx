import axios from "axios";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import React, {Component} from "react";
import {translate} from "react-i18next";
import "./IslandMap.css";
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
    // Unlock all islands for admins
    if (this.props.auth.user.role > 0) return true;

    // TODO: this is a blocking short-circuit for August. remove after Beta (done)
    // TODO2: adding back in a hard blocker for November Beta.
    // TODO3: blocker incremented for December Island.
    // TODO4: blocker incremented for January Island.
    if (milestone === "island-8b75") return false;
    return this.state.userProgress.find(up => up.level === milestone) !== undefined;
  }

  render() {

    const {userProgress} = this.state;
    const {auth, islands, t} = this.props;

    const {browserHistory} = this.context;

    if (!auth.user) browserHistory.push("/");

    if (islands === [] || !userProgress) return <Loading />;

    const islandArray = islands.slice(0);

    for (let i = 0; i < islandArray.length; i++) {
      const done = this.hasUserCompleted(islandArray[i].id);
      islandArray[i].isDone = done;
      islandArray[i].isNext = i === 0 && !done || i > 0 && !done && islandArray[i - 1].isDone;
    }

    return (
      <div className="content map u-text-center">
        {/* heading */}
        <div className="map-heading content-section">
          {/* hidden heading for accessibility */}
          <h1 className="u-visually-hidden">{t("Map")}</h1>
          {/* actual heading */}
          <h2 className="u-margin-bottom-off font-xl">
            {t("IslandMap.SelectIsland")}
          </h2>
        </div>
        {/* list of islands */}
        <div className="map-list content-section">
          { islandArray.map(island => <IslandLink key={island.id} island={island} standalone="false" />) }
        </div>
      </div>
    );
  }
}

Island.contextTypes = {
  browserHistory: PropTypes.object
};

const mapStateToProps = state => ({
  auth: state.auth,
  islands: state.islands
});

Island = connect(mapStateToProps)(Island);
export default translate()(Island);
