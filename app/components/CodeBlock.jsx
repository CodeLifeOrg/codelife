import axios from "axios";
import {connect} from "react-redux";
import {Link} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import himalaya from "himalaya";
import AceWrapper from "components/AceWrapper";
import {Intent, Position, Toaster, Alert} from "@blueprintjs/core";
import "./CodeBlock.css";

import Loading from "components/Loading";

class CodeBlock extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      isPassing: false,
      isOpen: false,
      rulejson: null
    };
  }

  componentDidMount() {
    const rulejson = JSON.parse(this.props.lesson.rulejson);
    const currentText = this.props.lesson.snippet.studentcontent;
    this.setState({mounted: true, currentText, rulejson}, this.renderText.bind(this));
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  grabContents() {
    return this.state.currentText;
  }

  renderText() {
    this.checkForErrors();
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.state.currentText);
      doc.close();
    }
  }

  handleClose() {
    this.setState({isOpen: false});
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

  saveProgress(level) {
    axios.post("/api/userprogress/save", {level}).then(resp => {
      resp.status === 200 ? console.log("successfully saved") : console.log("error");
    });
  }

  checkForErrors() {
    const jsonArray = himalaya.parse(this.state.currentText);
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
    this.setState({isPassing: errors === 0, rulejson});
  }

  onChangeText(theText) {
    this.setState({currentText: theText}, this.renderText.bind(this));
  }

  resetSnippet() {
    const {lesson} = this.props;
    if (lesson) this.setState({currentText: lesson.initialcontent}, this.renderText.bind(this));
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
      <ul>{vList}</ul>
    );
  }

  verifyAndSaveCode() {
    const {id: uid} = this.props.user;
    const {currentText: studentcontent} = this.state;
    const snippet = this.props.lesson.snippet;
    const lid = this.props.lesson.id;
    const name = `My ${this.props.lesson.name} Snippet`;

    if (!this.state.isPassing) {
      this.setState({isOpen: true, alertText: "Can't save a non-passing Codeblock!"});
      return;
    }

    this.saveProgress(lid);

    let endpoint = "/api/snippets/";
    // todo: double check that simply having a snippet is enough to justify an update over a new,
    // given the codeblock refactor
    
    // todo: maybe replace this with findorupdate from userprogress?
    snippet ? endpoint += "update" : endpoint += "new";
    axios.post(endpoint, {uid, lid, name, studentcontent}).then(resp => {
      if (resp.status === 200) {
        const t = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
        t.show({message: "Saved!", intent: Intent.SUCCESS});
        if (this.props.handleSave) this.props.handleSave(this.props.lesson.snippet.id, studentcontent);
      }
      else {
        alert("Error");
      }
    });
  }



  validateHTML() {

    /*
    const annotations = this.getEditor().getSession().getAnnotations();
    const validationText = {};
    validationText.info = "WARNINGS: \n\n";
    validationText.error = "ERRORS: \n\n";
    for (const a of annotations) {
      validationText[a.type] += `${a.text} \n\n`;
    }
    alert(`${validationText.info} ${validationText.error}`);
    */

  }

  render() {

    const {t, lesson} = this.props;
    const {isPassing} = this.state;

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
          { this.state.mounted ? <AceWrapper className="codeBlock-editor" ref={ comp => this.editor = comp } mode="html" onChange={this.onChangeText.bind(this)} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : <div className="codeBlock-editor"></div> }
          <iframe className="codeBlock-render" ref="rc" />
        </div>
        <div className="codeBlock-foot">
          <button className="pt-button" key="reset" onClick={this.resetSnippet.bind(this)}>Reset</button>
          <button className="pt-button pt-intent-success" key="save" onClick={this.verifyAndSaveCode.bind(this)}>Save & Submit</button>
          <br />
          { isPassing
            ? <div className="pt-callout pt-intent-success"><h5>Passing</h5></div>
            : <div className="pt-callout pt-intent-danger"><h5>Failing</h5></div>
          }
        </div>
        <Alert
            className="fail-alert"
            isOpen={this.state.isOpen}
            confirmButtonText="Okay"
            onConfirm={this.handleClose.bind(this)}
          >
          <p>
            {this.state.alertText}
          </p>
        </Alert>
      </div>
    );
  }
}

CodeBlock = connect(state => ({
  user: state.auth.user
}))(CodeBlock);
CodeBlock = translate()(CodeBlock);
export default CodeBlock;
