import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import himalaya from "himalaya";
import CodeEditor from "components/CodeEditor";
import {Alert, Intent, Position, Toaster, Popover, ProgressBar, Button, PopoverInteractionKind} from "@blueprintjs/core";
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
      meanings: [],
      styleMeanings: [],
      timeout: null,
      timeoutAlert: false
    };
  }

  componentDidMount() {
    const meanings = [];
    meanings.CONTAINS = [];
    meanings.CSS_CONTAINS = [];
    meanings.CONTAINS.html = "<html> surrounds your whole codeblock and tells the computer this is a webpage.";
    meanings.CONTAINS.head = "<head> is where your metadata is stored, such as your <title>.";
    meanings.CONTAINS.title = "<title> is the title of your page! Make sure it's inside a <head> tag.";
    meanings.CONTAINS.body = "<body> is where you put the content you want everyone to see.";
    meanings.CONTAINS.h1 = "<h1> is a header tag, where you can write really large text.";
    meanings.CONTAINS.h2 = "<h2> is a header tag, where you can write kind of large text.";
    meanings.CONTAINS.h3 = "<h3> is a header tag, where you can write large text.";
    meanings.CONTAINS.h4 = "<h4> is a header tag, where you can write small text.";
    meanings.CONTAINS.h5 = "<h5> is a header tag, where you can write kind of small text.";
    meanings.CONTAINS.h6 = "<h6> is a header tag, where you can write really small text.";
    meanings.CONTAINS.style = "<style> is where you customize your page with cool colors and fonts.";
    meanings.CONTAINS.p = "<p> is a paragraph tag, write sentences in here.";
    meanings.CSS_CONTAINS.h1 = "h1 within a <style> tag is how you customize your header tags.";
    meanings.CSS_CONTAINS.p = "p within a <style> tag is how you customize your <p> tags";
    const rulejson = JSON.parse(this.props.lesson.rulejson);
    let initialContent = "";
    if (this.props.lesson.initialContent) initialContent = this.props.lesson.initialcontent;
    if (this.props.lesson.snippet) initialContent = this.props.lesson.snippet.studentcontent;
    this.setState({mounted: true, initialContent, rulejson, meanings});
  }

  componentWillUnmount() {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
  }

  containsTag(needle, haystack) {
    return this.tagCount(needle, haystack) > 0;
  }

  askForHelp() {
    this.setState({timeoutAlert: "Having trouble? Check with a neighbor and ask for help!"});
  }

  tagCount(needle, haystack) {
    let count = 0;
    if (haystack.length === 0) return 0;
    for (const h of haystack) {
      if (h.type === "Element") {
        if (h.tagName === needle) {
          count++;
        } if (h.children !== null) {
          count += this.tagCount(needle, h.children);
        }
      }
    }
    return count;
  }

  onFirstCompletion(winMessage) {
    this.props.onFirstCompletion(winMessage);
  }

  saveProgress(level) {
    axios.post("/api/userprogress/save", {level}).then(resp => {
      resp.status === 200 ? console.log("successfully saved") : console.log("error");
    });
  }

  containsStyle(needle, haystack) {
    let head, html, style = null;
    let styleContent = "";
    if (haystack) html = haystack.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) style = head.children.find(e => e.tagName === "style");
    if (style) styleContent = style.children[0].content;

    const re = new RegExp(`${needle}\\s*{`);
    return re.exec(styleContent) ? true : false;
  }

  checkForErrors(theText) {
    const jsonArray = himalaya.parse(theText);
    const {rulejson} = this.state;
    let errors = 0;
    for (const r of rulejson) {
      if (r.type === "CONTAINS") {
        if (!this.containsTag(r.needle, jsonArray)) {
          errors++;
          r.passing = false;
        }
        else {
          r.passing = true;
        }
      }
      if (r.type === "CSS_CONTAINS") {
        if (!this.containsStyle(r.needle, jsonArray)) {
          errors++;
          r.passing = false;
        }
        else {
          r.passing = true;
        }
      }
    }
    const goodRatio = (rulejson.length - errors) / rulejson.length;
    let intent = this.state.intent;
    if (goodRatio < 0.5) intent = Intent.DANGER;
    else if (goodRatio < 1) intent = Intent.WARNING;
    else intent = Intent.SUCCESS;
    let timeout = this.state.timeout;
    if (errors === 0) {
      if (timeout) {
        clearTimeout(this.state.timeout);
        timeout = null;
      }
    } 
    else {
      if (!timeout) {
        timeout = setTimeout(this.askForHelp.bind(this), 120000);
      }
    }
    this.setState({isPassing: errors === 0, goodRatio, intent, rulejson, timeout});
  }

  onChangeText(theText) {
    this.checkForErrors(theText);
  }

  resetSnippet() {
    const {lesson} = this.props;
    let initialcontent = "";
    if (lesson & lesson.initialcontent) initialcontent = lesson.initialcontent;
    this.editor.setEntireContents(initialcontent);
    this.checkForErrors(initialcontent);
  }

  getValidationBox() {
    const {t} = this.props;
    const {goodRatio, intent, rulejson} = this.state;
    const iconList = [];
    iconList.CONTAINS = <span className="pt-icon-standard pt-icon-code"></span>;
    iconList.CSS_CONTAINS = <span className="pt-icon-standard pt-icon-highlight"></span>;

    const vList = rulejson.map(rule => {
      if (rule.passing) {
        return (
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            popoverClassName="pt-popover-content-sizing user-popover"
            position={Position.TOP_LEFT}
          >
            <li className="validation-item complete">
              <span className="checkbox pt-icon-standard pt-icon-small-tick"></span>
              <span className="rule">{rule.needle} {iconList[rule.type]}</span>
            </li>
            <div>
              { this.state.meanings[rule.type][rule.needle] }
            </div>
          </Popover>
        );
      }
      else {
        return (
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            popoverClassName="pt-popover-content-sizing user-popover"
            position={Position.TOP_LEFT}
          >
            <li className="validation-item">
              <span className="checkbox pt-icon-standard">&nbsp;</span>
              <span className="rule">{rule.needle} {iconList[rule.type]}</span>
            </li>  
            <div>
              { this.state.meanings[rule.type][rule.needle] }<br/><br/><div style={{color: "red"}}>{rule.error_msg}</div>
            </div>
          </Popover>
        );
      }
    });

    return (
      <div id="validation-box">
        <ul className="validation-list">{vList}</ul>
        <ProgressBar className="pt-no-stripes" intent={intent} value={goodRatio}/>
        { Math.round(goodRatio * 100) }% { t("Complete") }
      </div>
    );
  }

  verifyAndSaveCode() {
    const {id: uid} = this.props.auth.user;
    const studentcontent = this.editor.getEntireContents();
    let snippet = this.props.lesson.snippet;
    const lid = this.props.lesson.id;
    const name = `My ${this.props.lesson.name} Snippet`;

    if (!this.state.isPassing) {
      const t = Toaster.create({className: "submitToast", position: Position.TOP_CENTER});
      t.show({message: "Can't save non-passing code!", timeout: 1500, intent: Intent.DANGER});
      return;
    }

    this.saveProgress(lid);

    // todo: maybe replace this with findorupdate from userprogress?
    let endpoint = "/api/snippets/";
    snippet ? endpoint += "update" : endpoint += "new";
    axios.post(endpoint, {uid, lid, name, studentcontent}).then(resp => {
      if (resp.status === 200) {
        const t = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
        t.show({message: "Saved!", timeout: 1500, intent: Intent.SUCCESS});
        if (this.props.onFirstCompletion && !snippet) this.props.onFirstCompletion();
        snippet ? snippet.studentcontent = studentcontent : snippet = resp.data;
        if (this.props.handleSave) this.props.handleSave(snippet);
      }
      else {
        alert("Error");
      }
    });
  }

  render() {

    const {t, lesson} = this.props;
    const {initialContent, timeoutAlert} = this.state;

    if (!this.state.mounted) return <Loading />;

    const validationBox = this.getValidationBox();

    return (
      <div id="codeBlock">
        <div className="codeBlock-body">
          <Alert
            isOpen={ timeoutAlert ? true : false }
            confirmButtonText={ t("Okay") }
            intent={ Intent.SUCCESS }
            onConfirm={ () => this.setState({timeoutAlert: false}) }>
            <p>{ timeoutAlert ? timeoutAlert : "" }</p>
        </Alert>
          <div className="codeBlock-text">
            <div className="lesson-prompt" dangerouslySetInnerHTML={{__html: lesson.prompt}} />
            { validationBox }
          </div>
          { this.state.mounted ? <CodeEditor ref={c => this.editor = c} onChangeText={this.onChangeText.bind(this)} initialValue={initialContent}/> : <div className="codeEditor"></div> }
        </div>
        <div className="codeBlock-foot">
          <button className="pt-button" key="reset" onClick={this.resetSnippet.bind(this)}>{t("Reset")}</button>
          { lesson.snippet ? <Link className="pt-button" to={ `/share/snippet/${lesson.snippet.id}` }>Share this Snippet</Link> : null }
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            popoverClassName="pt-popover-content-sizing"
            position={Position.RIGHT_BOTTOM}
          >
            <Button intent={Intent.PRIMARY}>{t("Cheat Sheet")}</Button>
            <div>
              <h5>{lesson.name} Cheat Sheet</h5>
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
