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
      currentText: ""
    };
  }

  getEditor() {
    if (this.editor) {
      return this.editor.editor.editor;
    } 
    else {
      return null;
    }
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
      <div className="ic_container">
        <div className="ic_instructions">{htmlcontent1}</div>
        <div className="ic_codecontainer">{ this.state.mounted ? <Editor ref={ comp => this.editor = comp } onChange={this.onChangeText.bind(this)} mode="html" theme="monokai" showGutter={false} value={this.state.currentText} setOptions={{behavioursEnabled: false}}/> : null }</div>
        <div className="ic_rendercontainer"><iframe id="renderframe" ref="rf" /></div>
        <div className="clear" />
      </div>
    );
  }
}
