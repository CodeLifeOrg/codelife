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
    const {codeBlock, t, userProgress} = this.props;
    const {lid, snippetname, studentcontent, username} = codeBlock;

    const done = userProgress ? userProgress.find(p => p.level === lid) !== undefined : true;

    return (
      <div className={ `codeBlockCard pt-card pt-elevation-0 pt-interactive ${lid}` }>
        <div className="box" onClick={ this.toggleDialog.bind(this) }>
          <div className="icon" style={{backgroundImage: `url("/islands/${lid}-small.png")`}}></div>
          <div className="info">
            <div className="card-title">{ snippetname }</div>
            { username ? <div className="card-author">{ t("Created by") } { username }</div> : null }
          </div>
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
            <CodeEditor initialValue={studentcontent} preventSelection={!done} island={ lid } ref={c => this.editor = c} readOnly={true} />
            { /* TODO: find a way to use "done" to blur out code in ace-editor */ }
            { done ? null
              : <div className={ `pt-popover pt-tooltip ${ lid }` }>
                  <div className="pt-popover-content">
                    Codeblock's code will be shown after completing the last level of this island.
                  </div>
                </div> }
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-byline">{ username ? `${t("Created by")} {username}` : "" }</div>
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
