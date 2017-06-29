import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";
import Dragger from "components/Dragger";
import himalaya from "himalaya";
import axios from "axios";
import Snippets from "components/Snippets";
import "./Studio.css";

// Studio Page
// Test zone for inline code editing

class Editor extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      require("brace/mode/html");
      require("brace/theme/monokai");

      return <Ace ref={editor => this.editor = editor} {...this.props}/>;
    }
    return null;
  }
}

class Studio extends Component {

  constructor(props) {
    super(props);
    this.state = {mounted: false, output: "", checker: "", rules: []};
  }

  getRules() { 
    axios.get("api/rules"); 
  }

  componentDidMount() {
    axios.get("api/rules").then(resp => {
      this.setState({mounted: true, rules: resp.data});
    });  
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
  }

  onChange(theText) {
    this.setState({output: theText});
  }

  onClickItem(snippet) {
    this.insertTextAtCursor(snippet.htmlcontent);
  }

  saveCodeToDB() {
    console.log("Save This to DB:");
    console.log(this.getEditor().getValue());
  }

  validateHTML() {
    const annotations = this.getEditor().getSession().getAnnotations();
    const validationText = {};
    validationText.info = "WARNINGS: \n\n";
    validationText.error = "ERRORS: \n\n";
    for (const a of annotations) {
      validationText[a.type] += `${a.text} \n\n`;
    }
    alert(`${validationText.info} ${validationText.error}`);
  }

  submitAnswer() {
    const jsonArray = himalaya.parse(this.getEditor().getValue());
    let checkerText = "";
    for (const r of this.state.rules) {
      if (r.type === "CONTAINS") {
        if (!this.containsTag(r.needle, jsonArray)) {
          checkerText += `${r.error_msg}`;
        }
      }
    }
    this.setState({checker: checkerText});
  }

  containsTag(needle, haystack) {
    return this.tagCount(needle, haystack) > 0;
  }

  tagCount(needle, haystack) {
    let count = 0;
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

  render() {
    
    const {t} = this.props;
    const showDnD = true;

    return (  
      <div>
        <h1>{ t("Studio") }</h1>
        <Snippets onChoose={this.onClickItem.bind(this)}/>
        <div style={{width: "1100px"}}>
          <div style={{float: "left", width: "450px"}}>
          {/* todo - the value prop of Editor is where we put code loaded from the database */}
          {/* or, alternatively, with a seeded template, to which the user can reset while editing */}
          { this.state.mounted ? <Editor ref={ comp => this.editor = comp } mode="html" theme="monokai" onChange={this.onChange.bind(this)} value={this.state.output} setOptions={{behavioursEnabled: false}}/> : null }
          <button onClick={this.saveCodeToDB.bind(this)}>SAVE</button>
          <button onClick={this.validateHTML.bind(this)}>VALIDATE</button>
          <button onClick={this.submitAnswer.bind(this)}>SUBMIT</button>
          </div>
          <div style={{float: "right", border: "solid 1px black", width: "550px", height: "498px"}} dangerouslySetInnerHTML={{__html: this.state.output}} />
        </div>
        <div style={{clear: "both"}}>
          <div style={{width: "1100px", border: "1px solid black", padding: "5px"}}>
            { this.state.checker !== "" ? this.state.checker : "Press Submit to check your answer"}
          </div>
        </div>
        <div>
        <br/><br/>
          <Nav />
          <br/><br/>
          { showDnD ? <Dragger /> : null }
        </div>
      </div>
    );
  }
}

export default translate()(Studio);
