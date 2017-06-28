import React, {Component} from "react";
import {translate} from "react-i18next";
import Nav from "components/Nav";
import Dragger from "components/Dragger";
import {listSnippets, listRules} from "api";
import himalaya from "himalaya";

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
    this.state = {mounted: false, output: "", checker: ""};
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
  }

  onChange(theText) {
    // todo - don't set this on change, do it after init (when is that?)
    this.getEditor().setBehavioursEnabled(false);
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
    // todo - should this rules-fetch live someplace higher so it
    // doesn't need to make a db call every time we submit?
    const rules = listRules();
    console.log(rules);

    const jsonArray = himalaya.parse(this.getEditor().getValue());
    console.log(jsonArray);
    let checkerText = "";
    for (const r of rules) {
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
    const showDnD = false;

    const snippetArray = listSnippets();
    const snippetItems = snippetArray.map(snippet =>
      <li style={{display: "block", cursor: "pointer", width: "100px"}} onClick={this.onClickItem.bind(this, snippet)}>{snippet.name}</li>);

    return (  
      <div>
        <h1>{ t("Studio") }</h1>
        <ul>{snippetItems}</ul>
        <div style={{width: "1100px"}}>
          <div style={{float: "left", width: "450px"}}>
          { this.state.mounted ? <Editor ref={ comp => this.editor = comp } mode="html" theme="monokai" onChange={this.onChange.bind(this)} value={this.state.output} setOptions={{enableBasicAutocompletion: false, enableLiveAutocompletion: false}}/> : null }
          <button style={{margin: "10px", fontSize: "30px"}} onClick={this.saveCodeToDB.bind(this)}>SAVE</button>
          <button style={{margin: "10px", fontSize: "30px"}} onClick={this.validateHTML.bind(this)}>VALIDATE</button>
          <button style={{margin: "10px", fontSize: "30px"}} onClick={this.submitAnswer.bind(this)}>SUBMIT</button>
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
