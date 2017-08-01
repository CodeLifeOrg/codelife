import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import himalaya from "himalaya";
import CodeEditor from "components/CodeEditor";
import {Intent, Position, Toaster, Popover, Button, PopoverInteractionKind} from "@blueprintjs/core";
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
      rulejson: null
    };
  }

  componentDidMount() {
    const rulejson = JSON.parse(this.props.lesson.rulejson);
    let initialContent = this.props.lesson.initialcontent;
    if (this.props.lesson.snippet) initialContent = this.props.lesson.snippet.studentcontent;
    this.setState({mounted: true, initialContent, rulejson});
  }

  containsTag(needle, haystack) {
    return this.tagCount(needle, haystack) > 0;
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
    }
    let goodRatio = (rulejson.length - errors) / rulejson.length * 100;
    let intent = this.state.intent;
    if (goodRatio < 33) intent = "pt-intent-danger";
    if (goodRatio >= 33 && goodRatio <= 66) intent = "pt-intent-warning";
    if (goodRatio > 66) intent = "pt-intent-success";
    goodRatio += "%";
    this.setState({isPassing: errors === 0, goodRatio, intent, rulejson});
  }

  onChangeText(theText) {
    this.checkForErrors(theText);
  }

  resetSnippet() {
    const {lesson} = this.props;
    if (lesson) this.editor.setEntireContents(lesson.initialcontent);
  }

  getValidationBox() {
    const {rulejson} = this.state;
    const vList = rulejson.map(rule => {
      if (rule.passing) {
        return <li style={{color: "green"}}>✔ {rule.needle}</li>;
      } 
      else {
        return <li style={{color: "red"}}>✗ {rule.needle}</li>;
      }
    });
    
    return (
      <div>
        <ul>{vList}</ul>
        <div className={`pt-progress-bar pt-no-animation ${this.state.intent}`} style={{width: "200px"}}>
          <div className="pt-progress-meter " style={{width: this.state.goodRatio}}></div>
        </div>
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
    const {isPassing, initialContent} = this.state;

    if (!this.state.mounted) return <Loading />;

    const validationBox = this.getValidationBox();

    return (
      <div id="codeBlock">
        <div className="codeBlock-head">
          { lesson.prompt }<br/><br/>
          <div className="validation-text">
          { validationBox }
          </div>
          { lesson.snippet ? <Link className="share-link" to={ `/share/snippet/${lesson.snippet.id}` }>Share this Snippet</Link> : null }
        </div>
        <div className="codeBlock-body">
          { this.state.mounted ? <CodeEditor className="codeBlock-editor" ref={c => this.editor = c} onChangeText={this.onChangeText.bind(this)} initialValue={initialContent}/> : <div className="codeBlock-editor"></div> }
        </div>
        <div className="codeBlock-foot">
          <button className="pt-button" key="reset" onClick={this.resetSnippet.bind(this)}>Reset</button>
          
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            popoverClassName="pt-popover-content-sizing"
            position={Position.RIGHT}
          >
            <Button intent={Intent.PRIMARY}>CheatSheet</Button>
            <div>
              <h5>{lesson.name} Cheat Sheet</h5>
                <p style={{whiteSpace: "pre"}}>{lesson.cheatsheet}</p>
              <Button className="pt-popover-dismiss">Dismiss</Button>
            </div>
          </Popover>

          <button className="pt-button pt-intent-success" key="save" onClick={this.verifyAndSaveCode.bind(this)}>Save & Submit</button>

          <br />
          { isPassing
            ? <div className="pt-callout pt-intent-success"><h5>Passing</h5></div>
            : <div className="pt-callout pt-intent-danger"><h5>Failing</h5></div>
          }

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
