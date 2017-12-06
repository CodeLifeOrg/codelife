import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import CodeBlockCard from "components/CodeBlockCard";
import "./Profile.css";

/**
 * Class component for displaying lists of user's snippets.
 * This is shown on the public profile for a user and requires sending
 * 1 prop: a ref to the user
 */
class UserCodeBlocks extends Component {

  /**
   * Creates the UserSnippets component with initial state.
   * @param {boolean} loading - true by defaults gets flipped post AJAX.
   * @param {array} snippets - Gets set by AJAX call from DB call.
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      codeBlocks: [],
      likes: null,
      reports: null
    };
  }

  /**
   * Grabs user id from user prop, makes AJAX call to server and returns
   * the list of snippets.
   */
  componentDidMount() {
    const {user} = this.props;
    const cbget = axios.get(`/api/codeBlocks/byuser?uid=${user.id}`);
    const lkget = axios.get("/api/likes");
    const rget = axios.get("/api/reports/codeblocks");
    const scget = axios.get("/api/siteconfigs");

    Promise.all([cbget, lkget, rget, scget]).then(resp => {
      const constants = resp[3].data;
      const codeBlocks = resp[0].data.filter(cb => cb.status !== "banned" && cb.sharing !== "false" && Number(cb.reports) < constants.FLAG_COUNT_HIDE);
      console.log(codeBlocks);
      const likes = resp[1].data;
      const reports = resp[2].data;
      codeBlocks.sort((a, b) => a.id - b.id);
      this.setState({loading: false, codeBlocks, likes, reports});
    });
  }

  render() {
    const {t} = this.props;
    const {loading, codeBlocks, likes, reports} = this.state;
    const {islands} = this.props;

    if (loading) return <h2>{ t("Loading codeblocks") }...</h2>;

    return (
      <div className="user-section">
        <h2>{ t("Code Blocks") }</h2>
        <div className="flex-row">
          { codeBlocks.length
            ? codeBlocks.map(cb => {
              if (likes.find(l => l.likeid === cb.id)) cb.liked = true;
              if (reports.find(r => r.report_id === cb.id)) cb.reported = true;
              const {theme, icon} = islands.find(i => i.id === cb.lid);
              return <CodeBlockCard key={cb.id} codeBlock={cb} theme={theme} icon={icon} />;
            })
            : <p>{ t("This user doesn't have any code blocks yet.") }</p>}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({islands: state.islands});

UserCodeBlocks = connect(mapStateToProps)(UserCodeBlocks);

export default translate()(UserCodeBlocks);
