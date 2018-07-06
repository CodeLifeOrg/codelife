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
      codeBlocks: []
    };
  }

  /**
   * Grabs user id from user prop, makes AJAX call to server and returns
   * the list of snippets.
   */
  componentDidMount() {
    const {user} = this.props;
    const cbget = axios.get(`/api/codeBlocks/byuser?uid=${user.id}`);

    Promise.all([cbget]).then(resp => {
      const codeBlocks = resp[0].data;
      this.setState({loading: false, codeBlocks});
    });
  }

  render() {
    const {islands, myProfile, t, user} = this.props;
    const {loading, codeBlocks} = this.state;

    // set heading text
    let heading = t("UserCodeBlocksList", {username: user.name || user.username});
    myProfile === true ? heading = t("My CodeBlocks") : null;

    if (loading) return <h2>{ t("Loading codeblocks") }...</h2>;

    return (
      <div className="user-section">
        <h2 className="user-heading font-xl">{ heading }</h2>
        <div className="card-list">
          { codeBlocks.length
            ? codeBlocks.map(cb => {
              const {theme, icon} = islands.find(i => i.id === cb.lid);
              return <CodeBlockCard key={cb.id} codeBlock={cb} theme={theme} icon={icon} />;
            })
            : <p>{ t("noCodeblocks") }</p>}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({islands: state.islands});

UserCodeBlocks = connect(mapStateToProps)(UserCodeBlocks);

export default translate()(UserCodeBlocks);
