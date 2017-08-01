import axios from "axios";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";
import CodeBlock from "components/CodeBlock";
import "./Profile.css";

/**
 * Class component for displaying lists of user's snippets.
 * This is shown on the public profile for a user and requires sending
 * 1 prop: a ref to the user
 */
class UserSnippets extends Component {

  /**
   * Creates the UserSnippets component with initial state.
   * @param {boolean} loading - true by defaults gets flipped post AJAX.
   * @param {array} snippets - Gets set by AJAX call from DB call.
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      lessons: [],
      snippets: [],
      userProgress: null,
      didInject: false,
      currentFrame: null
    };
  }

  /**
   * Grabs user id from user prop, makes AJAX call to server and returns
   * the list of snippets.
   */
  componentDidMount() {
    const {user} = this.props;
    axios.get(`/api/snippets/byuser?uid=${user.id}`).then(resp => {
      this.setState({loading: false, snippets: resp.data});
    });
  }

  toggleDialog(i) {
    const k = `isOpen_${i}`;
    let currentFrame = null;
    if (!this.state[k]) currentFrame = i;
    this.setState({[k]: !this.state[k], didInject: false, currentFrame});
  }

  renderSnippets(snippets) {
    // console.log(snippets)
    // return <div>snippets</div>
    return snippets.map((snippet, i) =>
      <div className="view-snippit">
        <Button className="pt-icon-endorsed" onClick={this.toggleDialog.bind(this, i)} text={snippet.snippetname} />
        <Dialog
          isOpen={this.state[`isOpen_${i}`]}
          onClose={this.toggleDialog.bind(this, i)}
          title={snippet.snippetname}
          lazy={false}
          inline={true}
          className="codeblock-dialog"
        >
          <div className="pt-dialog-body">{<CodeBlock lesson={snippet.lid} />}</div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <Button
                intent={Intent.PRIMARY}
                onClick={this.toggleDialog.bind(this, i)}
                text="Close"
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  render() {
    const {t} = this.props;
    const {loading, snippets} = this.state;

    if (loading) return <h2>{ t("Loading snipppets...") }</h2>;

    return (
      <div className="user-section">
        <h2>{ t("Snippets") }</h2>
        { snippets.length
          ? this.renderSnippets(snippets)
          : <p>{ t("This user doesn't have any snippets yet.") }</p>}
      </div>
    );
  }
}

export default translate()(UserSnippets);
