import React, {Component} from "react";
import {translate} from "react-i18next";
import {Button, Dialog, Intent} from "@blueprintjs/core";

import CodeEditor from "components/CodeEditor";
import "./CodeBlockCard.css";

class CodeBlockCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  toggleDialog() {
    this.setState({open: !this.state.open});
  }

  render() {

    const {open} = this.state;
    const {codeBlock, island, t, userProgress} = this.props;
    const {snippetname, studentcontent, username} = codeBlock;

    const done = userProgress ? userProgress.find(p => p.level === island) !== undefined : true;

    return (
      <div className={ `codeBlockCard pt-card pt-elevation-2 pt-interactive ${island}` }>
        <div className="box" onClick={ this.toggleDialog.bind(this) }>
          <div className="snippet-title">{ snippetname }</div>
          <div className="author">{ t("created by") } { username }</div>
        </div>
        <Dialog
          isOpen={ open }
          onClose={ this.toggleDialog.bind(this) }
          title={ snippetname }
          lazy={false}
          inline={true}
          style={{
            height: "75vh",
            maxHeight: "600px",
            maxWidth: "800px",
            width: "100%"
          }}
        >
          <div className="pt-dialog-body">
            <CodeEditor initialValue={studentcontent} preventSelection={!done} island={ island } ref={c => this.editor = c} readOnly={true} />
            { /* TODO: find a way to use "done" to blur out code in ace-editor */ }
            { done ? null
              : <div className={ `pt-popover pt-tooltip ${ island }` }>
                  <div className="pt-popover-content">
                    Codeblock's code will be shown after completing the last level of this island.
                  </div>
                </div> }
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-byline">{ t("created by") } { username }</div>
            <div className="pt-dialog-footer-actions">
              <Button
                intent={ Intent.PRIMARY }
                onClick={ this.toggleDialog.bind(this) }
                text={ t("Close") }
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

CodeBlockCard = translate()(CodeBlockCard);
export default CodeBlockCard;
