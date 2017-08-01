import axios from "axios";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Tab2, Tabs2, Toaster} from "@blueprintjs/core";
import himalaya from "himalaya";

import AceWrapper from "components/AceWrapper";

import "./CodeEditor.css";

class CodeEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mounted: false,
      currentText: "",
      changesMade: false,
      titleText: ""
    };
  }

  componentDidMount() {
    this.setState({mounted: true, currentText: this.props.initialValue}, this.renderText.bind(this));
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  setTitleText() {
    const content = himalaya.parse(this.state.currentText);
    let head, html, title = null;
    let titleText = "";
    if (content) html = content.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) title = head.children.find(e => e.tagName === "title");
    if (title && title.children[0]) titleText = title.children[0].content;
    this.setState({titleText});
  }

  renderText() {
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.getEditor().getValue());
      doc.close();
    }
    this.setTitleText();
  }

  onChangeText(theText) {
    console.log("hi");
    this.setState({currentText: theText, changesMade: true}, this.renderText.bind(this));
  }

  /* External Functions for Parent Component to Call */

  setEntireContents(theText) {
    this.setState({currentText: theText, changesMade: false}, this.renderText.bind(this));
  }

  insertTextAtCursor(theText) {
    this.getEditor().insert(`\n ${theText} \n`);
    this.setState({currentText: this.getEditor().getValue(), changesMade: true}, this.renderText.bind(this));
  }

  getEntireContents() {
    return this.state.currentText;
  }

  changesMade() {
    return this.state.changesMade;
  }

  setChangeStatus(changesMade) {
    this.setState({changesMade});
  }

  /* End of external functions */

  render() {

    const {auth, t} = this.props;
    const {titleText, currentText} = this.state;

    return (
      <div id="code-editor-comp">
        <div className="title-tab" style={{textAlign:"right"}}>{titleText}</div>
        
        <div id="code-editor-panels">
          { this.state.mounted ? 
            <AceWrapper 
              width="400px"
              height="500px" 
              className="code-editor-ace" 
              ref={ comp => this.editor = comp } 
              onChange={this.onChangeText.bind(this)} 
              value={currentText}
              {...this.props}
            /> : <div className="code-editor-ace"></div> }
          <iframe className="code-editor-render" ref="rc" />
        </div>
      </div>
    );
  }
}

export default CodeEditor;
