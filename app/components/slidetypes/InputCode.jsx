import React, {Component} from "react";
import {translate} from "react-i18next";
import himalaya from "himalaya";
import "./InputCode.css";

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

export default class InputCode extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      mounted: false, 
      currentText: "",
      checkerResult: "Press Submit to submit your answer"
    };
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  submitAnswer() {
    const jsonArray = himalaya.parse(this.getEditor().getValue());
    let checkerText = "";
    for (const r of this.props.rulejson) {
      if (r.type === "CONTAINS") {
        if (!this.containsTag(r.needle, jsonArray)) {
          checkerText += `${r.error_msg}\n`;
        }
      }
    }
    // todo make this more resilient lol
    if (checkerText === "") {
      checkerText = "You got it right!";
      this.props.unblock();
    }
    this.setState({checkerResult: checkerText});
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

  resetAnswer() {
    this.setState({currentText: this.props.htmlcontent2}, this.renderText.bind(this));
  }

  renderText() {
    const doc = this.refs.rf.contentWindow.document;
    doc.open();
    doc.write(this.state.currentText);
    doc.close();
  }

  onChangeText(theText) {
    this.setState({currentText: theText}, this.renderText.bind(this));
  }

  componentDidMount() {
    this.setState({mounted: true, currentText: this.props.htmlcontent2}, this.renderText.bind(this));
  }
  
  render() {
    
    const {t, htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="ic_container">
        <div id="ic_instructions">{htmlcontent1}</div>
        <div id="ic_code-container">{ this.state.mounted ? <Editor ref={ comp => this.editor = comp } onChange={this.onChangeText.bind(this)} mode="html" theme="monokai" showGutter={false} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : null }</div>
        <div id="ic_render-container"><iframe id="render-frame" ref="rf" /></div>
        <div className="clear" />
        <button className="ic_button" onClick={this.submitAnswer.bind(this)}>SUBMIT</button>
        <button className="ic_button" onClick={this.resetAnswer.bind(this)}>RESET</button>
        <div id="ic_errorcontainer">{this.state.checkerResult}</div>
      </div>
    );
  }
}
