import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {browserHistory} from "react-router";
import {translate} from "react-i18next";
import CodeEditor from "components/CodeEditor/CodeEditor";
import {Alert, Intent, Position, Toaster, Popover, Button, PopoverInteractionKind} from "@blueprintjs/core";
import "./CodeBlock.css";

import Loading from "components/Loading";

class CodeBlock extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      initialContent: "",
      isPassing: false,
      execState: false, 
      isOpen: false,
      goodRatio: 0,
      intent: null,
      rulejson: null,
      resetAlert: false,
      filename: ""
    };
  }

  componentDidMount() {
    const rulejson = JSON.parse(this.props.island.rulejson);
    let initialContent = "";
    let filename = "";
    if (this.props.island.initialcontent) initialContent = this.props.island.initialcontent;
    if (this.props.island.codeBlock) {
      initialContent = this.props.island.codeBlock.studentcontent;
      filename = this.props.island.codeBlock.snippetname;
    }
    this.setState({mounted: true, initialContent, filename, rulejson});
  }

  onFirstCompletion(winMessage) {
    this.props.onFirstCompletion(winMessage);
  }

  setExecState(execState) {
    this.setState({execState});
  }

  saveProgress(level) {
    // Status is completed because there is no way to "skip" a codeblock
    axios.post("/api/userprogress/save", {level, status: "completed"}).then(resp => {
      resp.status === 200 ? console.log("successfully saved progress") : console.log("error");
    });
  }

  onChangeText(theText) {
    // nothing yet
  }

  resetCodeBlock() {
    const {island} = this.props;
    let initialcontent = "";
    if (island && island.initialcontent) initialcontent = island.initialcontent;
    this.editor.getWrappedInstance().getWrappedInstance().setEntireContents(initialcontent);
    this.setState({resetAlert: false});
  }

  attemptReset() {
    this.setState({resetAlert: true});
  }

  executeCode() {
    this.editor.getWrappedInstance().getWrappedInstance().executeCode();
  }

  changeFilename(e) {
    this.setState({filename: e.target.value});
  }

  shareCodeblock() {
    const {t} = this.props;
    const {username} = this.props.auth.user;
    if (this.editor && !this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
      browserHistory.push(`/codeBlocks/${username}/${this.props.island.codeBlock.snippetname}`);
    }
    else {
      const toast = Toaster.create({className: "shareCodeblockToast", position: Position.TOP_CENTER});
      toast.show({message: t("Save your webpage before sharing!"), intent: Intent.WARNING});
    }
  }

  verifyAndSaveCode() {
    const {t} = this.props;
    const {id: uid} = this.props.auth.user;
    const studentcontent = this.editor.getWrappedInstance().getWrappedInstance().getEntireContents();
    let codeBlock = this.props.island.codeBlock;
    const iid = this.props.island.id;
    let name = t("myCodeblock", {islandName: this.props.island.name});

    if (!this.editor.getWrappedInstance().getWrappedInstance().isPassing()) {
      const toast = Toaster.create({className: "submitToast", position: Position.TOP_CENTER});
      toast.show({message: t("Can't save non-passing code!"), timeout: 1500, intent: Intent.DANGER});
      return;
    }

    this.saveProgress(iid);

    // todo: maybe replace this with findorupdate from userprogress?
    // this regex trims leading and trailing spaces from the filename
    if (this.state.filename !== "") name = this.state.filename.replace(/^\s+|\s+$/gm, "");
    let endpoint = "/api/codeBlocks/";
    codeBlock ? endpoint += "update" : endpoint += "new";
    axios.post(endpoint, {uid, iid, name, studentcontent}).then(resp => {
      if (resp.status === 200) {
        const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
        toast.show({message: t("Saved!"), timeout: 1500, intent: Intent.SUCCESS});
        if (this.editor) this.editor.getWrappedInstance().getWrappedInstance().setChangeStatus(false);
        if (this.props.onFirstCompletion && !codeBlock) this.props.onFirstCompletion();
        if (codeBlock) {
          // If there's already a snippet, and we've saved new data down to the
          // database, we need to update our "in-memory" snippet to reflect the
          // db changes.  We then call parent.handleSave to put this updated snippet
          // back into currentLesson.snippet, saving us a db call.
          codeBlock.studentcontent = studentcontent;
          codeBlock.snippetname = name;
        }
        else {
          codeBlock = resp.data;
        }
        if (this.props.handleSave) this.props.handleSave(codeBlock);
      }
      else {
        alert(t("Error"));
      }
    });
  }

  render() {
    const {t, island} = this.props;
    const {initialContent, rulejson, execState} = this.state;

    if (!this.state.mounted) return <Loading />;

    return (
      <div id="codeBlock">
        <div style={{textAlign: "right"}} className="codeblock-filename-form">
          {t("Codeblock Name")} <input className="pt-input codeblock-filename" type="text" value={this.state.filename} placeholder={ t("Codeblock Title") } onChange={this.changeFilename.bind(this)} />
        </div>
        <div className="codeBlock-body">
          <Alert
            isOpen={ this.state.resetAlert }
            cancelButtonText={ t("Cancel") }
            confirmButtonText={ t("Reset") }
            intent={ Intent.DANGER }
            onCancel={ () => this.setState({resetAlert: false}) }
            onConfirm={ () => this.resetCodeBlock() }>
            <p>{ t("Are you sure you want to reset the code to its original state?") }</p>
          </Alert>
          <div className="codeBlock-text">
            <div className="lesson-prompt" dangerouslySetInnerHTML={{__html: island.prompt}} />
          </div>
          { this.state.mounted ? <CodeEditor ref={c => this.editor = c} setExecState={this.setExecState.bind(this)} rulejson={rulejson} onChangeText={this.onChangeText.bind(this)} initialValue={initialContent}/> : <div className="codeEditor"></div> }
        </div>
        <div className="codeBlock-foot">
          <button className="pt-button" key="reset" onClick={this.attemptReset.bind(this)}>{t("Reset")}</button>
          { island.codeBlock ? <span className="pt-button" onClick={this.shareCodeblock.bind(this)}>{ t("Share") }</span> : null }
          { execState ? <button className="pt-button pt-intent-warning" onClick={this.executeCode.bind(this)}>{t("Execute")}</button> : null }
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            popoverClassName="pt-popover-content-sizing"
            position={Position.RIGHT_BOTTOM}
          >
            <Button intent={Intent.PRIMARY} iconName="help">{t("Help")}</Button>
            <div>
              <h5>{island.name} - {t("Help")}</h5>
              <p dangerouslySetInnerHTML={{__html: island.cheatsheet}} />
            </div>
          </Popover>
          <button className="pt-button pt-intent-success" key="save" onClick={this.verifyAndSaveCode.bind(this)}>{t("Save & Submit")}</button>
        </div>
      </div>
    );
  }
}

CodeBlock = connect(state => ({
  auth: state.auth
}))(CodeBlock);
CodeBlock = translate()(CodeBlock);
export default CodeBlock;
