import axios from "axios";
import {connect} from "react-redux";
import {browserHistory} from "react-router";
import React, {Component} from "react";
import {translate} from "react-i18next";
import {Intent, Position, Tab2, Tabs2, Toaster} from "@blueprintjs/core";
import himalaya from "himalaya";

import AceWrapper from "components/AceWrapper";
import Loading from "components/Loading";

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
    if (this.props.onChangeText) this.props.onChangeText(this.props.initialValue);
  }

  getEditor() {
    if (this.editor) return this.editor.editor.editor;
  }

  getTitleText(theText) {
    const content = himalaya.parse(theText);
    let head, html, title = null;
    let titleText = "";
    if (content) html = content.find(e => e.tagName === "html");
    if (html) head = html.children.find(e => e.tagName === "head");
    if (head) title = head.children.find(e => e.tagName === "title");
    if (title && title.children[0]) titleText = title.children[0].content;
    return titleText;
  }

  renderText() {
    if (this.refs.rc) {
      const doc = this.refs.rc.contentWindow.document;
      doc.open();
      doc.write(this.state.currentText);
      doc.close();
    }
  }

  onChangeText(theText) {
    const titleText = this.getTitleText(theText);
    this.setState({currentText: theText, changesMade: true, titleText}, this.renderText.bind(this));
    if (this.props.onChangeText) this.props.onChangeText(theText);
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

    if (!this.state.mounted) return <Loading />;

    return (
      <div id="code-editor-comp">
        <div className="title-tab" style={{color: "black", textAlign:"right"}}>{titleText}</div>
        
        <div id="code-editor-panels">
          { !this.props.preventSelection ? 
            <AceWrapper 
              width="400px"
              height="500px" 
              className="code-editor-ace" 
              ref={ comp => this.editor = comp } 
              onChange={this.onChangeText.bind(this)} 
              value={currentText}
              {...this.props}
            /> : <pre className="snippet-popup-code blurry-text">{currentText}</pre> }
          <iframe className="code-editor-render" ref="rc" />
        </div>
      </div>
    );
  }
}

export default CodeEditor;
