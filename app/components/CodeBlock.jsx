import axios from "axios";
import {connect} from "react-redux";
import React, {Component} from "react";
import {browserHistory} from "react-router";
import {translate} from "react-i18next";
import CodeEditor from "components/CodeEditor";
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
      isOpen: false,
      goodRatio: 0,
      intent: null,
      rulejson: null,
      timeout: null,
      timeoutAlert: false,
      resetAlert: false,
      filename: ""
    };
  }

  componentDidMount() {
    const rulejson = JSON.parse(this.props.lesson.rulejson);
    let initialContent = "";
    let filename = "";
    if (this.props.lesson.initialcontent) initialContent = this.props.lesson.initialcontent;
    if (this.props.lesson.snippet) {
      initialContent = this.props.lesson.snippet.studentcontent;
      filename = this.props.lesson.snippet.snippetname;
    }
    this.setState({mounted: true, initialContent, filename, rulejson});
  }

  componentWillUnmount() {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
  }

  askForHelp() {
    const {t} = this.props;
    this.setState({timeoutAlert: t("Having trouble? Check with a neighbor and ask for help!")});
  }

  onFirstCompletion(winMessage) {
    this.props.onFirstCompletion(winMessage);
  }

  saveProgress(level) {
    axios.post("/api/userprogress/save", {level}).then(resp => {
      resp.status === 200 ? console.log("successfully saved") : console.log("error");
    });
  }

  onChangeText(theText) {
    // nothing yet
  }

  resetSnippet() {
    const {lesson} = this.props;
    let initialcontent = "";
    if (lesson && lesson.initialcontent) initialcontent = lesson.initialcontent;
    this.editor.getWrappedInstance().setEntireContents(initialcontent);
    // this.checkForErrors(initialcontent);
    this.setState({resetAlert: false});
  }

  attemptReset() {
    this.setState({resetAlert: true});
  }

  executeCode() {
    this.editor.getWrappedInstance().executeCode();
  }

  changeFilename(e) {
    this.setState({filename: e.target.value});
  }

  shareCodeblock() {
    const {t} = this.props;
    const {username} = this.props.auth.user;
    if (this.editor && !this.editor.getWrappedInstance().changesMade()) {
      browserHistory.push(`/snippets/${username}/${this.props.lesson.snippet.snippetname}`);
    }
    else {
      const toast = Toaster.create({className: "shareCodeblockToast", position: Position.TOP_CENTER});
      toast.show({message: t("Save your webpage before sharing!"), intent: Intent.WARNING});
    }
  }

  verifyAndSaveCode() {
    const {t} = this.props;
    const {id: uid} = this.props.auth.user;
    const studentcontent = this.editor.getWrappedInstance().getEntireContents();
    let snippet = this.props.lesson.snippet;
    const lid = this.props.lesson.id;
    // let name = `My ${this.props.lesson.name} Codeblock`;
    let name = t("myCodeblock", {islandName: this.props.lesson.name});

    if (!this.editor.getWrappedInstance().isPassing()) {
      const toast = Toaster.create({className: "submitToast", position: Position.TOP_CENTER});
      toast.show({message: t("Can't save non-passing code!"), timeout: 1500, intent: Intent.DANGER});
      return;
    }

    this.saveProgress(lid);

    // todo: maybe replace this with findorupdate from userprogress?
    if (this.state.filename !== "") name = this.state.filename;
    let endpoint = "/api/snippets/";
    snippet ? endpoint += "update" : endpoint += "new";
    axios.post(endpoint, {uid, lid, name, studentcontent}).then(resp => {
      if (resp.status === 200) {
        const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
        toast.show({message: t("Saved!"), timeout: 1500, intent: Intent.SUCCESS});
        if (this.editor) this.editor.getWrappedInstance().setChangeStatus(false);
        if (this.props.onFirstCompletion && !snippet) this.props.onFirstCompletion();
        if (snippet) {
          // If there's already a snippet, and we've saved new data down to the
          // database, we need to update our "in-memory" snippet to reflect the
          // db changes.  We then call parent.handleSave to put this updated snippet
          // back into currentLesson.snippet, saving us a db call.
          snippet.studentcontent = studentcontent;
          snippet.snippetname = name;
        }
        else {
          snippet = resp.data;
        }
        if (this.props.handleSave) this.props.handleSave(snippet);
      }
      else {
        alert(t("Error"));
      }
    });
  }

  render() {
    const {t, lesson} = this.props;
    const {initialContent, timeoutAlert, rulejson} = this.state;

    if (!this.state.mounted) return <Loading />;

    return (
      <div id="codeBlock">
        <div style={{textAlign: "right"}} className="codeblock-filename-form">
            {t("Codeblock Name")} <input className="pt-input codeblock-filename" type="text" value={this.state.filename} placeholder={ t("Codeblock Title") } onChange={this.changeFilename.bind(this)} />
        </div>
        <div className="codeBlock-body">
          <Alert
            isOpen={ timeoutAlert ? true : false }
            confirmButtonText={ t("Okay") }
            intent={ Intent.SUCCESS }
            onConfirm={ () => this.setState({timeoutAlert: false}) }>
            <p>{ timeoutAlert ? timeoutAlert : "" }</p>
        </Alert>
         <Alert
            isOpen={ this.state.resetAlert }
            cancelButtonText={ t("Cancel") }
            confirmButtonText={ t("Reset") }
            intent={ Intent.DANGER }
            onCancel={ () => this.setState({resetAlert: false}) }
            onConfirm={ () => this.resetSnippet() }>
            <p>{ t("Are you sure you want to reset the code to its original state?") }</p>
        </Alert>
          <div className="codeBlock-text">
            <div className="lesson-prompt" dangerouslySetInnerHTML={{__html: lesson.prompt}} />
          </div>
          { this.state.mounted ? <CodeEditor ref={c => this.editor = c} rulejson={rulejson} onChangeText={this.onChangeText.bind(this)} initialValue={initialContent}/> : <div className="codeEditor"></div> }
        </div>
        <div className="codeBlock-foot">
          <button className="pt-button" key="reset" onClick={this.attemptReset.bind(this)}>{t("Reset")}</button>
          { lesson.snippet ? <span className="pt-button" onClick={this.shareCodeblock.bind(this)}>{ t("Share") }</span> : null }
          <button className="pt-button pt-intent-warning" onClick={this.executeCode.bind(this)}>{t("Execute")}</button>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            popoverClassName="pt-popover-content-sizing"
            position={Position.RIGHT_BOTTOM}
          >
            <Button intent={Intent.PRIMARY} iconName="help">{t("Help")}</Button>
            <div>
              <h5>{lesson.name} - {t("Help")}</h5>
              <p dangerouslySetInnerHTML={{__html: lesson.cheatsheet}} />
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
