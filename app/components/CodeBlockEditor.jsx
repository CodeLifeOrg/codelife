import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {translate} from "react-i18next";
import PropTypes from "prop-types";
import CodeEditor from "components/CodeEditor/CodeEditor";
import {Alert, Button, EditableText, Intent, Popover, PopoverInteractionKind, Position, Tabs2, Tab2, Toaster} from "@blueprintjs/core";

import Loading from "components/Loading";

import "./Studio.css";
import "./CodeBlockEditor.css";

class CodeBlockEditor extends Component {

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
      filename: "",
      activeTabId: "codeblockeditor-prompt-tab"
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
    const {browserHistory} = this.context;
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
    const username = this.props.auth.user.username;
    console.log(username);
    axios.post(endpoint, {uid, username, iid, name, studentcontent}).then(resp => {
      if (resp.status === 200) {
        this.setState({canEditTitle: true});
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

  handleTabChange(activeTabId) {
    this.setState({activeTabId});
  }

  render() {
    const {t, island, title} = this.props;
    const {activeTabId, execState, initialContent, rulejson} = this.state;

    if (!this.state.mounted) return <Loading />;

    // prompt
    const promptTab =
    <div className="codeblockeditor-prompt"
      id="codeblockeditor-prompt"
      dangerouslySetInnerHTML={{__html: island.prompt}}
    />;

    // cheatsheet
    const cheatsheetTab =
    <div className="codeblockeditor-cheatsheet"
      id="codeblockeditor-cheatsheet"
      dangerouslySetInnerHTML={{__html: island.cheatsheet}}
    />;


    return (
      <div className="codeblockeditor-container" id="codeBlock">

        {/* body */}
        <div className="studio-body codeblockeditor-body">

          {/* controls */}
          <div className="studio-controls">

            {/* page title */}
            <h1 className="font-sm">{ island.name } { t("codeblock") }</h1>

            {/* codeblock title */}
            {/* TODO: convert to editable text */}
            <label
              className="codeblockeditor-title studio-title heading font-lg"
              htmlFor="codeblockeditor-title-edit" >
              {this.state.filename}
            </label>

            {/* make edit field available if codeblock isn't read only */}
            {!this.props.readOnly &&
              <div className="field-container font-sm">
                <input
                  className="codeblockeditor-filename u-margin-top-md font-sm"
                  id="codeblockeditor-title-edit"
                  type="text"
                  value={this.state.filename}
                  placeholder={ t("Codeblock Title") }
                  onChange={this.changeFilename.bind(this)} />
              </div>
            }

            {/* actions title */}
            <h3 className="studio-subtitle font-sm">{t("Actions")}</h3>

            {/* list of actions */}
            <ul className="studio-action-list font-xs u-list-reset">

              {/* save & submit codeblock */}
              <li className="studio-action-item">
                <button className="studio-action-button u-unbutton link" onClick={this.verifyAndSaveCode.bind(this)} key="save">
                  <span className="studio-action-button-icon pt-icon pt-icon-floppy-disk" />
                  <span className="studio-action-button-text u-hide-below-xxs">{ t("Save & Submit") }</span>
                </button>
              </li>

              {/* execute code */}
              <li className="studio-action-item">
                <button
                  className={ `studio-action-button u-unbutton link ${!execState && " is-disabled"}` }
                  onClick={this.executeCode.bind(this)}
                  tabIndex={!execState && "-1"}>
                  <span className="studio-action-button-icon pt-icon pt-icon-refresh" />
                  <span className="studio-action-button-text u-hide-below-xxs">{ t("CodeBlockEditor.Execute") }</span>
                </button>
              </li>

              {/* share codeblock */}
              <li className="studio-action-item">
                <button className="studio-action-button u-unbutton link" onClick={this.shareCodeblock.bind(this)}>
                  <span className="studio-action-button-icon pt-icon pt-icon-share" />
                  <span className="studio-action-button-text u-hide-below-xxs">{ t("CodeBlockEditor.Share") }</span>
                </button>
              </li>

              {/* reset codeblock */}
              <li className="studio-action-item">
                <button className="studio-action-button u-unbutton link danger-text" onClick={this.attemptReset.bind(this)}>
                  <span className="studio-action-button-icon pt-icon pt-icon-undo" />
                  <span className="studio-action-button-text u-hide-below-xxs">{t("CodeBlockEditor.Reset")}</span>
                </button>
              </li>

            </ul>


            {/* help text */}
            <div className="codeblockeditor-text font-xs">

              {/* tab between prompt and cheatsheet */}
              <Tabs2
                id="codeblockeditor-tabs"
                onChange={ this.handleTabChange.bind(this) }
                selectedTabId={activeTabId}>
                <Tab2 id="codeblockeditor-prompt-tab" title={ t("Prompt") } panel={ promptTab } />
                <Tab2 id="codeblockeditor-cheatsheet-tab" title={ t("Cheatsheet") } panel={ cheatsheetTab } />
                <Tabs2.Expander />
              </Tabs2>

            </div>
          </div>


          {/* editor */}
          <div className="studio-editor">
            { this.state.mounted
              ? <CodeEditor
                readOnly={this.props.readOnly}
                ref={c => this.editor = c}
                setExecState={this.setExecState.bind(this)}
                rulejson={rulejson}
                onChangeText={this.onChangeText.bind(this)}
                initialValue={initialContent} />
              : <div className="code-editor" /> // placeholder container
            }
          </div>
        </div>


        {/* reset alert */}
        <Alert
          isOpen={ this.state.resetAlert }
          cancelButtonText={ t("Cancel") }
          confirmButtonText={ t("buttonReset") }
          intent={ Intent.DANGER }
          onCancel={ () => this.setState({resetAlert: false}) }
          onConfirm={ () => this.resetCodeBlock() }>
          <p>{ t("Are you sure you want to reset the code to its original state?") }</p>
        </Alert>

      </div>
    );
  }
}

CodeBlockEditor.contextTypes = {
  browserHistory: PropTypes.object
};

CodeBlockEditor = connect(state => ({
  auth: state.auth
}))(CodeBlockEditor);
CodeBlockEditor = translate()(CodeBlockEditor);
export default CodeBlockEditor;
