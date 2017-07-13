import React, {Component} from "react";
import {translate} from "react-i18next";
import himalaya from "himalaya";
import "./RenderCode.css";

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

export default class RenderCode extends Component {

  constructor(props) {
    super(props);
    this.state = { 
      mounted: false, 
      currentText: "",
    };
  }

  getEditor() {
    return this.editor.editor.editor;
  }

  renderText() {
    if (this.refs.rf) {
      const doc = this.refs.rf.contentWindow.document;
      doc.open();
      doc.write(this.props.htmlcontent2);
      doc.close();
    }
  }

  componentDidMount() {
    this.setState({mounted: true, currentText: this.props.htmlcontent2}, this.renderText.bind(this));
  }
  
  render() {
    
    const {t, htmlcontent1, htmlcontent2} = this.props;

    return (
      <div id="rc_container">
        <div id="rc_instructions">{htmlcontent1}</div>
        <div id="rc_code-container">{ this.state.mounted ? <Editor ref={ comp => this.editor = comp } mode="html" theme="monokai" readOnly={true} showGutter={false} value={htmlcontent2} setOptions={{behavioursEnabled: false}}/> : null }</div>
        <div id="rc_render-container"><iframe id="render-frame" ref="rf" /></div>
        <div className="clear" />
      </div>
    );
  }
}
