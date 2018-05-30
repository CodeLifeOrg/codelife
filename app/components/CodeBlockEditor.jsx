import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {translate} from "react-i18next";
import PropTypes from "prop-types";
import CodeEditor from "components/CodeEditor/CodeEditor";
import {Alert, Button, Dialog, EditableText, Intent, Popover, PopoverInteractionKind, Position, Tabs2, Tab2, Toaster} from "@blueprintjs/core";

import LoadingSpinner from "components/LoadingSpinner";
import ShareDirectLink from "components/ShareDirectLink";
import ShareFacebookLink from "components/ShareFacebookLink";

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
      saving: false,
      canPostToFacebook: true,
      filename: "",
      originalFilename: "",
      canEditTitle: true,
      activeTabId: "codeblockeditor-prompt-tab"
    };
    this.handleKey = this.handleKey.bind(this); // keep this here to scope shortcuts to this page
  }

  componentDidMount() {
    const rulejson = JSON.parse(this.props.island.rulejson);
    let initialContent = "";
    let filename = "";
    let originalFilename = "";
    if (this.props.island.initialcontent) initialContent = this.props.island.initialcontent;
    if (this.props.island.codeBlock) {
      initialContent = this.props.island.codeBlock.studentcontent;
      filename = this.props.island.codeBlock.snippetname;
      originalFilename = filename;
    }
    this.setState({mounted: true, initialContent, filename, originalFilename, rulejson});

    // start listening for keypress when entering the page
    document.addEventListener("keypress", this.handleKey);
  }

  // stop listening for keypress when leaving the page
  componentWillUnmount() {
    document.removeEventListener("keypress", this.handleKey);
    clearTimeout(this.timeout);
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

  changeCodeblockName(newName) {
    const canEditTitle = false;
    newName = newName.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");
    const originalFilename = newName;
    const filename = newName;
    this.setState({originalFilename, filename, canEditTitle});
    this.verifyAndSaveCode.bind(this)();
  }

  clickSave() {
    const saving = true;
    this.setState({saving}, this.verifyAndSaveCode.bind(this));
  }

  shareCodeblock() {
    const {t} = this.props;
    const {username} = this.props.auth.user;
    const {browserHistory} = this.context;
    if (this.editor && !this.editor.getWrappedInstance().getWrappedInstance().changesMade()) {
      // browserHistory.push(`/codeBlocks/${username}/${this.props.island.codeBlock.snippetname}`);
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
      this.setState({filename: this.state.originalFilename, canEditTitle: true});
      return;
    }

    this.saveProgress(iid);

    // todo: maybe replace this with findorupdate from userprogress?
    // this regex trims leading and trailing spaces from the filename and removes URL-breaking characters
    if (this.state.filename !== "") name = this.state.filename.replace(/^\s+|\s+$/gm, "").replace(/[^a-zA-ZÀ-ž0-9-\ _]/g, "");
    let endpoint = "/api/codeBlocks/";
    codeBlock ? endpoint += "update" : endpoint += "new";
    const username = this.props.auth.user.username;
    axios.post(endpoint, {uid, username, iid, name, studentcontent}).then(resp => {
      if (resp.status === 200) {
        this.setState({canEditTitle: true, saving: false, canPostToFacebook: false});
        this.timeout = setTimeout(() => this.setState({canPostToFacebook: true}), 6000);
        const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
        toast.show({message: t("Saved!"), timeout: 1500, intent: Intent.SUCCESS});
        if (this.editor) this.editor.getWrappedInstance().getWrappedInstance().setChangeStatus(false);

        // Uncomment this to test Win Dialog
        // if (this.props.onFirstCompletion) this.props.onFirstCompletion();
        if (this.props.onFirstCompletion && !codeBlock) this.props.onFirstCompletion();

        if (codeBlock) {
          // If there's already a snippet, and we've saved new data down to the
          // database, we need to update our "in-memory" snippet to reflect the
          // db changes.  We then call parent.handleSave to put this updated snippet
          // back into currentLesson.snippet, saving us a db call.
          codeBlock.studentcontent = studentcontent;
          codeBlock.snippetname = name;
          codeBlock.slug = resp.data.slug;
        }
        else {
          codeBlock = resp.data;
        }
        if (this.props.handleSave) this.props.handleSave(codeBlock);
      }
      else {
        this.setState({saving: false});
        alert(t("Error"));
      }
    });
  }

  handleTabChange(activeTabId) {
    this.setState({activeTabId});
  }

  handleKey(e) {
    // cmd+s = save
    // if (e.key === "s" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) { // should work, but doesn't override browser save dialog
    if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
      this.verifyAndSaveCode();
    }
    // else if (e.key === "e" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) { // should work, but doesn't override browser URL bar focus
    else if (e.key === "e" && e.ctrlKey) {
      e.preventDefault();
      this.executeCode(); // NOTE: doesn't work when editor has focus
    }
    // else if (e.key === "r" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) { // should work, but doesn't override browser refresh
    else if (e.key === "r" && e.ctrlKey) {
      e.preventDefault();
      this.attemptReset();
    }
  }

  render() {
    const {t, island, readOnly} = this.props;
    const {activeTabId, execState, initialContent, rulejson, filename, originalFilename, canEditTitle, saving, canPostToFacebook} = this.state;

    const {origin} = this.props.location;
    const {username} = this.props.auth.user;

    // get share link, if in edit view
    let shareLink = "";
    const {codeBlock} = this.props.island;
    readOnly || !codeBlock ? shareLink = "" : shareLink = encodeURIComponent(`${origin}/codeBlocks/${username}/${codeBlock.slug ? codeBlock.slug : codeBlock.snippetname}`);

    if (!this.state.mounted) return <LoadingSpinner />;

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

          {/* controls, if not read only */}
          { !readOnly
            ? <div className="studio-controls">

              {/* page title */}
              <h1 className="font-sm">{ island.name } { t("codeblock") }</h1>

              {/* codeblock title */}
              <h2 className="studio-title font-lg">
                <EditableText
                  value={filename}
                  selectAllOnFocus={true}
                  onChange={t => this.setState({filename: t})}
                  onCancel={() => this.setState({filename: originalFilename})}
                  onConfirm={this.changeCodeblockName.bind(this)}
                  multiline={true}
                  disabled={!canEditTitle}
                  confirmOnEnterKey={true}
                />
              </h2>

              {/* actions title */}
              <h3 className="studio-subtitle font-sm">{t("Actions")}</h3>

              {/* list of actions */}
              <ul className="studio-action-list font-xs u-list-reset">

                {/* save & submit codeblock */}
                <li className="studio-action-item">
                  <button disabled={saving} className="studio-action-button u-unbutton link" onClick={this.clickSave.bind(this)} key="save">
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
                {shareLink && <li className="studio-action-item">
                  <button className="studio-action-button u-unbutton link" onClick={() => this.setState({isShareOpen: true})}>
                    <span className="studio-action-button-icon pt-icon pt-icon-share" />
                    <span className="studio-action-button-text u-hide-below-xxs">{ t("CodeBlockEditor.Share") }</span>
                  </button>
                </li>
                }

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


            // prompt only if readOnly
            : <div className="studio-controls is-read-only">
              <div className="codeblockeditor-text u-margin-top-sm">

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
          }


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
          className="alert-container form-container"
          isOpen={ this.state.resetAlert }
          cancelButtonText={ t("Cancel") }
          confirmButtonText={ t("buttonReset") }
          intent={ Intent.DANGER }
          onCancel={ () => this.setState({resetAlert: false}) }
          onConfirm={ () => this.resetCodeBlock() }>
          <p className="font-lg u-margin-top-off u-margin-bottom-md">{ t("Are you sure you want to reset the code to its original state?") }</p>
        </Alert>


        {/* share dialog triggered by share button */}
        <Dialog
          isOpen={this.state.isShareOpen}
          onClose={() => this.setState({isShareOpen: false})}
          title={t("Share your Project")}
          className="share-dialog form-container u-text-center"
        >

          <h2 className="share-heading font-lg u-margin-bottom-off">
            {t("ShareDirectLink.Label")}:
          </h2>

          {/* direct link */}
          <div className="field-container share-direct-link-field-container u-margin-top-off u-margin-bottom-sm">
            <ShareDirectLink link={shareLink} fontSize="font-md" linkLabel={false} />
          </div>

          {/* facebook */}
          <div className="field-container u-margin-top-off">
            <ShareFacebookLink context="codeblock" shareLink={shareLink} screenshotReady={canPostToFacebook} />
          </div>
        </Dialog>

      </div>
    );
  }
}

CodeBlockEditor.contextTypes = {
  browserHistory: PropTypes.object
};

CodeBlockEditor = connect(state => ({
  auth: state.auth,
  location: state.location
}))(CodeBlockEditor);
CodeBlockEditor = translate()(CodeBlockEditor);
export default CodeBlockEditor;
